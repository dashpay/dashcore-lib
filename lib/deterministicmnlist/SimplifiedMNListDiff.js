const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const { isHexa: isHexString, isHexStringOfSize } = require('../util/js');

const SimplifiedMNListEntry = require('./SimplifiedMNListEntry');
const QuorumEntry = require('./QuorumEntry');
const PartialMerkleTree = require('../block/PartialMerkleTree');
const Transaction = require('../transaction');
const constants = require('../constants');
const Networks = require('../networks');
const readVarintCount = require('../util/readVarintCount');
const { readExact, readExactReverse } = require('../transaction/payload/strictpayloadreader');

// nVersion, proRegTxHash, confirmedHash, an empty ExtNetInfo (version and purpose
// count), pubKeyOperator, keyIDVoting and isValid
const MIN_SML_ENTRY_SIZE = 2 + 32 + 32 + 2 + 48 + 20 + 1;
// version, llmqType, quorumHash, two empty bit sets, quorumPublicKey,
// quorumVvecHash, quorumSig and membersSig
const MIN_QUORUM_ENTRY_SIZE = 2 + 1 + 32 + 1 + 1 + 48 + 32 + 96 + 96;

/**
 * @param {*} value
 * @return {boolean}
 */
function isDenseArray(value) {
  // a hole leaves a key missing, so this rejects sparse arrays (of any length)
  // without materializing them
  return Array.isArray(value) && Object.keys(value).length === value.length;
}

/**
 * @param {number[]} values
 * @return {boolean}
 */
function isStrictlyIncreasing(values) {
  return values.every((value, i) => i === 0 || values[i - 1] < value);
}

/**
 * @param {Buffer|Object|string} [arg] - A Buffer, JSON string, or Object representing a MnListDiff
 * @param {string} [network]
 * @param {Object} [llmqParamsOverride]
 * @class SimplifiedMNListDiff
 * @property {string} baseBlockHash - sha256
 * @property {string} blockHash - sha256
 * @property {PartialMerkleTree} cbTxMerkleTree
 * @property {Transaction} cbTx
 * @property {number} nVersion
 * @property {Array<string>} deletedMNs - sha256 hashes of deleted MNs
 * @property {Array<SimplifiedMNListEntry>} mnList
 * @property {Array<obj>} deletedQuorums - deleted quorum objects
 * @property {Array<QuorumEntry>} newQuorums
 * @property {string} merkleRootMNList - merkle root of the whole mn list
 * @property {string} merkleRootQuorums - merkle root of the quorum list
 * @property {Array<Object<string, number[]>>} [quorumsCLSigs] - chainlock signatures
 * used for quorum rotation, each mapped to indexes into newQuorums
 */
function SimplifiedMNListDiff(arg, network, llmqParamsOverride = {}) {
  if (arg) {
    const validNetwork = Networks.get(network);

    if (arg instanceof SimplifiedMNListDiff) {
      return arg.copy();
    }
    if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListDiff.fromBuffer(arg, validNetwork, llmqParamsOverride);
    }
    if (_.isObject(arg)) {
      return SimplifiedMNListDiff.fromObject(arg, validNetwork, llmqParamsOverride);
    }
    if (isHexString(arg)) {
      return SimplifiedMNListDiff.fromHexString(arg, validNetwork, llmqParamsOverride);
    }
    throw new TypeError(
      'Unrecognized argument passed to SimplifiedMNListDiff constructor'
    );
  }
}

/**
 * Creates MnListDiff from a Buffer holding Core's P2P `mnlistdiff` message
 * (protocol 70230 and later, unchanged through 70242).
 * @param {Buffer} buffer
 * @param {string} [network]
 * @param {Object} [llmqParamsOverride]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromBuffer = function fromBuffer(buffer, network, llmqParamsOverride = {}) {
  const bufferReader = new BufferReader(Buffer.from(buffer));
  const data = {};

  data.nVersion = bufferReader.readUInt16LE();
  data.baseBlockHash = readExactReverse(bufferReader, constants.SHA256_HASH_SIZE).toString('hex');
  data.blockHash = readExactReverse(bufferReader, constants.SHA256_HASH_SIZE).toString('hex');

  data.cbTxMerkleTree = PartialMerkleTree.fromBufferReader(bufferReader);
  const cbTxStart = bufferReader.pos;
  data.cbTx = new Transaction().fromBufferReader(bufferReader);
  // The transaction parser accepts non-canonical CompactSizes, which Core
  // rejects; a canonical coinbase serializes back to exactly what was read
  if (!data.cbTx.toBuffer().equals(bufferReader.buf.slice(cbTxStart, bufferReader.pos))) {
    throw new Error('Non-canonical coinbase transaction encoding');
  }

  const deletedMNsCount = readVarintCount(
    bufferReader,
    constants.SHA256_HASH_SIZE,
    'Deleted masternode'
  );
  data.deletedMNs = [];
  for (let i = 0; i < deletedMNsCount; i += 1) {
    data.deletedMNs.push(
      readExactReverse(bufferReader, constants.SHA256_HASH_SIZE).toString('hex')
    );
  }

  const mnListSize = readVarintCount(bufferReader, MIN_SML_ENTRY_SIZE, 'Masternode list entry');
  data.mnList = [];
  for (let i = 0; i < mnListSize; i += 1) {
    data.mnList.push(
      SimplifiedMNListEntry.fromP2PBufferReader(bufferReader, network)
    );
  }

  const deletedQuorumsCount = readVarintCount(
    bufferReader,
    1 + constants.SHA256_HASH_SIZE,
    'Deleted quorum'
  );
  data.deletedQuorums = [];
  for (let i = 0; i < deletedQuorumsCount; i += 1) {
    const deletedQuorum = {};
    deletedQuorum.llmqType = bufferReader.readUInt8();
    deletedQuorum.quorumHash = readExactReverse(bufferReader, constants.SHA256_HASH_SIZE)
      .toString('hex');
    data.deletedQuorums.push(deletedQuorum);
  }

  const newQuorumsSize = readVarintCount(bufferReader, MIN_QUORUM_ENTRY_SIZE, 'New quorum');
  data.newQuorums = [];
  for (let i = 0; i < newQuorumsSize; i += 1) {
    data.newQuorums.push(
      QuorumEntry.fromP2PBufferReader(bufferReader, llmqParamsOverride)
    );
  }

  // Core's RPC form: [{ <signature hex>: [indexes into newQuorums] }, ...]
  // a signature and its (possibly empty) index count
  const quorumsCLSigsCount = readVarintCount(
    bufferReader,
    constants.BLS_SIGNATURE_SIZE + 1,
    'Quorum chainlock signature'
  );
  data.quorumsCLSigs = [];
  const seenSignatures = new Set();
  for (let i = 0; i < quorumsCLSigsCount; i += 1) {
    const signature = readExact(bufferReader, constants.BLS_SIGNATURE_SIZE)
      .toString('hex');
    // Core holds these in a map of sets, so a repeated signature or an index
    // out of ascending order can't come from Core and wouldn't round-trip
    if (seenSignatures.has(signature)) {
      throw new Error('Duplicate quorum chainlock signature');
    }
    seenSignatures.add(signature);
    const indexesCount = readVarintCount(bufferReader, 2, 'Quorum index');
    const indexes = [];
    for (let j = 0; j < indexesCount; j += 1) {
      indexes.push(bufferReader.readUInt16LE());
    }
    if (!isStrictlyIncreasing(indexes)) {
      throw new Error('Quorum chainlock indexes are not a sorted set');
    }
    data.quorumsCLSigs.push({ [signature]: indexes });
  }

  if (!bufferReader.finished()) {
    throw new Error('MnListDiff is followed by unexpected data');
  }

  data.merkleRootMNList = data.cbTx.extraPayload.merkleRootMNList;
  if (data.cbTx.extraPayload.version >= 2) {
    data.merkleRootQuorums = data.cbTx.extraPayload.merkleRootQuorums;
  }
  return this.fromObject(data, network, llmqParamsOverride);
};

/**
 * @param {string} hexString
 * @param {string} [network]
 * @param {Object} [llmqParamsOverride]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromHexString = function fromHexString(
  hexString,
  network,
  llmqParamsOverride = {}
) {
  return SimplifiedMNListDiff.fromBuffer(
    Buffer.from(hexString, 'hex'),
    network,
    llmqParamsOverride
  );
};

/**
 * Serializes mnlist diff as Core's P2P `mnlistdiff` message (protocol 70230
 * and later). Quorums need their LLMQ type params, for the bit set sizes.
 * @return {Buffer}
 */
SimplifiedMNListDiff.prototype.toBuffer = function toBuffer() {
  const bufferWriter = new BufferWriter();

  // Diffs from Core RPC that predate nVersion are version 1
  bufferWriter.writeUInt16LE(typeof this.nVersion === 'number' ? this.nVersion : 1);
  bufferWriter.write(Buffer.from(this.baseBlockHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.blockHash, 'hex').reverse());

  bufferWriter.write(this.cbTxMerkleTree.toBuffer());
  bufferWriter.write(this.cbTx.toBuffer());

  ['deletedMNs', 'mnList', 'deletedQuorums', 'newQuorums'].forEach((name) => {
    $.checkArgument(isDenseArray(this[name]), `Expected ${name} to be an array without empty slots`);
  });
  $.checkArgument(
    this.quorumsCLSigs === undefined || isDenseArray(this.quorumsCLSigs),
    'Expected quorumsCLSigs to be an array without empty slots'
  );

  bufferWriter.writeVarintNum(this.deletedMNs.length);
  this.deletedMNs.forEach((deleteMNHash) => {
    bufferWriter.write(Buffer.from(deleteMNHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.mnList.length);
  this.mnList.forEach((simplifiedMNListEntry) => {
    bufferWriter.write(simplifiedMNListEntry.toP2PBuffer());
  });

  bufferWriter.writeVarintNum(this.deletedQuorums.length);
  this.deletedQuorums.forEach((deletedQuorum) => {
    bufferWriter.writeUInt8(deletedQuorum.llmqType);
    bufferWriter.write(Buffer.from(deletedQuorum.quorumHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.newQuorums.length);
  this.newQuorums.forEach((quorumEntry) => {
    // the hashed serialization is the one Core sends
    bufferWriter.write(quorumEntry.toBufferForHashing());
  });

  const quorumsCLSigs = this.quorumsCLSigs || [];
  bufferWriter.writeVarintNum(quorumsCLSigs.length);
  const writtenSignatures = new Set();
  quorumsCLSigs.forEach((quorumsCLSig) => {
    const signatures = _.isPlainObject(quorumsCLSig) ? Object.keys(quorumsCLSig) : [];
    $.checkArgument(
      signatures.length === 1,
      'Expected each quorumsCLSigs entry to hold exactly one signature'
    );
    const [signature] = signatures;
    const indexes = quorumsCLSig[signature];
    $.checkArgument(
      isHexStringOfSize(signature, constants.BLS_SIGNATURE_SIZE * 2),
      'Expected quorumsCLSigs keys to be bls signatures'
    );
    $.checkArgument(
      !writtenSignatures.has(signature.toLowerCase()),
      'Expected each quorumsCLSigs signature to appear once'
    );
    writtenSignatures.add(signature.toLowerCase());
    $.checkArgument(
      isDenseArray(indexes)
        && indexes.every((index) => Number.isInteger(index) && index >= 0 && index <= 0xffff),
      'Expected quorumsCLSigs values to be arrays of quorum indexes'
    );
    $.checkArgument(
      isStrictlyIncreasing(indexes),
      'Expected quorumsCLSigs indexes to be sorted and unique, as Core sends them'
    );
    bufferWriter.write(Buffer.from(signature, 'hex'));
    bufferWriter.writeVarintNum(indexes.length);
    indexes.forEach((index) => bufferWriter.writeUInt16LE(index));
  });

  return bufferWriter.toBuffer();
};

/**
 * Creates MNListDiff from object
 * @param obj
 * @param {string|Network} [network]
 * @param {Object} [llmqParamsOverride]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromObject = function fromObject(obj, network, llmqParamsOverride = {}) {
  const simplifiedMNListDiff = new SimplifiedMNListDiff();

  const validNetwork = Networks.get(network);

  simplifiedMNListDiff.baseBlockHash = obj.baseBlockHash;
  simplifiedMNListDiff.blockHash = obj.blockHash;

  /* cbTxMerkleRoot start */
  simplifiedMNListDiff.cbTxMerkleTree = new PartialMerkleTree(
    obj.cbTxMerkleTree
  );
  /* cbTxMerkleRoot stop */

  simplifiedMNListDiff.cbTx = new Transaction(obj.cbTx);

  simplifiedMNListDiff.nVersion = obj.nVersion;

  // Copy array of strings
  simplifiedMNListDiff.deletedMNs = obj.deletedMNs.slice();
  simplifiedMNListDiff.mnList = obj.mnList.map(
    (entry) => new SimplifiedMNListEntry(entry, validNetwork)
  );
  simplifiedMNListDiff.deletedQuorums = obj.deletedQuorums.slice();
  simplifiedMNListDiff.newQuorums = obj.newQuorums.map(
    (quorumEntry) => new QuorumEntry(quorumEntry, llmqParamsOverride)
  );
  simplifiedMNListDiff.merkleRootMNList = obj.merkleRootMNList;
  if (obj.merkleRootQuorums) {
    simplifiedMNListDiff.merkleRootQuorums = obj.merkleRootQuorums;
  }
  if (obj.quorumsCLSigs) {
    simplifiedMNListDiff.quorumsCLSigs = _.cloneDeep(obj.quorumsCLSigs);
  }

  if (simplifiedMNListDiff.mnList.length > 0) {
    if (
      validNetwork &&
      simplifiedMNListDiff.mnList[0].network.name !== validNetwork.name
    ) {
      throw new Error(
        `votingAddress network is not equal to ${validNetwork.name}`
      );
    }

    simplifiedMNListDiff.network = simplifiedMNListDiff.mnList[0].network;
  } else {
    simplifiedMNListDiff.network = validNetwork;
  }

  return simplifiedMNListDiff;
};

/**
 * This method constructs the diff from the JSON produced by JSON.sringify.
 * PLEASE DON'T PASS RESULT OF .toObject() to this method!
 * @param {Object} diffJSON
 * @param {Object} [llmqParamsOverride]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromJSON = function fromJSON(diffJSON, llmqParamsOverride= {}) {
  const cbTxMerkleTree = new PartialMerkleTree();
  cbTxMerkleTree.totalTransactions = diffJSON.cbTxMerkleTree.totalTransactions;
  cbTxMerkleTree.merkleHashes = diffJSON.cbTxMerkleTree.merkleHashes;
  cbTxMerkleTree.merkleFlags = diffJSON.cbTxMerkleTree.merkleFlags;

  return SimplifiedMNListDiff.fromObject(
    {
      ...diffJSON,
      cbTxMerkleTree,
    },
    Networks.get(diffJSON.network.name),
    llmqParamsOverride
  );
};

SimplifiedMNListDiff.prototype.toObject = function toObject() {
  const obj = {};
  obj.baseBlockHash = this.baseBlockHash;
  obj.blockHash = this.blockHash;

  /* cbTxMerkleRoot start */
  obj.cbTxMerkleTree = this.cbTxMerkleTree.toString();
  /* cbTxMerkleRoot stop */

  obj.cbTx = this.cbTx.serialize(true);

  obj.nVersion = this.nVersion;

  // Copy array of strings
  obj.deletedMNs = this.deletedMNs.slice();
  obj.mnList = this.mnList.map((SMLEntry) => SMLEntry.toObject());
  obj.deletedQuorums = this.deletedQuorums.slice();
  obj.newQuorums = this.newQuorums.map((SMLEntry) => SMLEntry.toObject());
  obj.merkleRootMNList = this.merkleRootMNList;
  if (this.merkleRootQuorums) {
    obj.merkleRootQuorums = this.merkleRootQuorums;
  }
  if (this.quorumsCLSigs) {
    obj.quorumsCLSigs = _.cloneDeep(this.quorumsCLSigs);
  }

  return obj;
};

SimplifiedMNListDiff.prototype.copy = function copy() {
  // entries copy themselves to keep the ExtNetInfo bytes they were read from
  return _.cloneDeepWith(this, (value) => (
    value instanceof SimplifiedMNListEntry ? value.copy() : undefined
  ));
};

module.exports = SimplifiedMNListDiff;
