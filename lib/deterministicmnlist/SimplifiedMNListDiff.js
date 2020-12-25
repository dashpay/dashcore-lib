const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const isHexString = require('../util/js').isHexa;

const SimplifiedMNListEntry = require('./SimplifiedMNListEntry');
const QuorumEntry = require('./QuorumEntry');
const PartialMerkleTree = require('../block/PartialMerkleTree');
const Transaction = require('../transaction');
const constants = require('../constants');
const Networks = require('../networks');

/**
 * @param {Buffer|Object|string} [arg] - A Buffer, JSON string, or Object representing a MnListDiff
 * @param {string} [network]
 * @class SimplifiedMNListDiff
 * @property {string} baseBlockHash - sha256
 * @property {string} blockHash - sha256
 * @property {PartialMerkleTree} cbTxMerkleTree
 * @property {Transaction} cbTx
 * @property {Array<string>} deletedMNs - sha256 hashes of deleted MNs
 * @property {Array<SimplifiedMNListEntry>} mnList
 * @property {Array<obj>} deletedQuorums - deleted quorum objects
 * @property {Array<QuorumEntry>} newQuorums
 * @property {string} merkleRootMNList - merkle root of the whole mn list
 * @property {string} merkleRootQuorums - merkle root of the quorum list
 */
function SimplifiedMNListDiff(arg, network) {
  if (arg) {
    const validNetwork = Networks.get(network);

    if (arg instanceof SimplifiedMNListDiff) {
      return arg.copy();
    } if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListDiff.fromBuffer(arg, validNetwork);
    } if (_.isObject(arg)) {
      return SimplifiedMNListDiff.fromObject(arg, validNetwork);
    } if (isHexString(arg)) {
      return SimplifiedMNListDiff.fromHexString(arg, validNetwork);
    }
    throw new TypeError('Unrecognized argument passed to SimplifiedMNListDiff constructor');
  }
}

/**
 * Creates MnListDiff from a Buffer.
 * @param {Buffer} buffer
 * @param {string} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromBuffer = function fromBuffer(buffer, network) {
  const bufferReader = new BufferReader(Buffer.from(buffer));
  const data = {};

  data.baseBlockHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');
  data.blockHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');

  data.cbTxMerkleTree = PartialMerkleTree.fromBufferReader(bufferReader);
  data.cbTx = new Transaction().fromBufferReader(bufferReader);

  const deletedMNsCount = bufferReader.readVarintNum();
  data.deletedMNs = [];
  for (let i = 0; i < deletedMNsCount; i += 1) {
    data.deletedMNs.push(bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex'));
  }

  const mnListSize = bufferReader.readVarintNum();
  data.mnList = [];
  for (let i = 0; i < mnListSize; i += 1) {
    data.mnList.push(SimplifiedMNListEntry.fromBuffer(bufferReader.read(constants.SML_ENTRY_SIZE), network));
  }

  const deletedQuorumsCount = bufferReader.readVarintNum();
  data.deletedQuorums = [];
  for (let i = 0; i < deletedQuorumsCount; i += 1) {
    const deletedQuorum = {};
    deletedQuorum.llmqType = bufferReader.readUInt8();
    deletedQuorum.quorumHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');
    data.deletedQuorums.push(deletedQuorum);
  }

  const newQuorumsSize = bufferReader.readVarintNum();
  data.newQuorums = [];
  for (let i = 0; i < newQuorumsSize; i += 1) {
    const quorumEntrySize = bufferReader.readVarintNum();
    const entry = bufferReader.read(quorumEntrySize);

    data.newQuorums.push(QuorumEntry.fromBuffer(entry));
  }

  data.merkleRootMNList = data.cbTx.extraPayload.merkleRootMNList;
  if (data.cbTx.extraPayload.version >= 2) {
    data.merkleRootQuorums = data.cbTx.extraPayload.merkleRootQuorums;
  }
  return this.fromObject(data, network);
};

/**
 * @param {string} hexString
 * @param {string} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromHexString = function fromHexString(hexString, network) {
  return SimplifiedMNListDiff.fromBuffer(Buffer.from(hexString, 'hex'), network);
};

/**
 * Serializes mnlist diff to a Buffer
 * @return {Buffer}
 */
SimplifiedMNListDiff.prototype.toBuffer = function toBuffer() {
  const bufferWriter = new BufferWriter();

  bufferWriter.write(Buffer.from(this.baseBlockHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.blockHash, 'hex').reverse());

  bufferWriter.write(this.cbTxMerkleTree.toBuffer());
  bufferWriter.write(this.cbTx.toBuffer());

  bufferWriter.writeVarintNum(this.deletedMNs.length);
  this.deletedMNs.forEach((deleteMNHash) => {
    bufferWriter.write(Buffer.from(deleteMNHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.mnList.length);
  this.mnList.forEach((simplifiedMNListEntry) => {
    bufferWriter.write(simplifiedMNListEntry.toBuffer());
  });

  bufferWriter.writeVarintNum(this.deletedQuorums.length);
  this.deletedQuorums.forEach((deletedQuorum) => {
    bufferWriter.writeUInt8(deletedQuorum.llmqType);
    bufferWriter.write(Buffer.from(deletedQuorum.quorumHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.newQuorums.length);
  this.newQuorums.forEach((quorumEntry) => {
    bufferWriter.writeVarintNum(quorumEntry.toBuffer().length);
    bufferWriter.write(quorumEntry.toBuffer());
  });

  return bufferWriter.toBuffer();
};

/**
 * Creates MNListDiff from object
 * @param obj
 * @param {string|Network} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromObject = function fromObject(obj, network) {
  const simplifiedMNListDiff = new SimplifiedMNListDiff();

  const validNetwork = Networks.get(network);

  simplifiedMNListDiff.baseBlockHash = obj.baseBlockHash;
  simplifiedMNListDiff.blockHash = obj.blockHash;

  /* cbTxMerkleRoot start */
  simplifiedMNListDiff.cbTxMerkleTree = new PartialMerkleTree(obj.cbTxMerkleTree);
  /* cbTxMerkleRoot stop */

  simplifiedMNListDiff.cbTx = new Transaction(obj.cbTx);
  // Copy array of strings
  simplifiedMNListDiff.deletedMNs = obj.deletedMNs.slice();
  simplifiedMNListDiff.mnList = obj.mnList.map(
    SMLEntry => new SimplifiedMNListEntry(SMLEntry, validNetwork),
  );
  simplifiedMNListDiff.deletedQuorums = obj.deletedQuorums.slice();
  simplifiedMNListDiff.newQuorums = obj.newQuorums.map(quorumEntry => new QuorumEntry(quorumEntry));
  simplifiedMNListDiff.merkleRootMNList = obj.merkleRootMNList;
  if (obj.merkleRootQuorums) {
    simplifiedMNListDiff.merkleRootQuorums = obj.merkleRootQuorums;
  }

  if (simplifiedMNListDiff.mnList.length > 0) {
    if (validNetwork && simplifiedMNListDiff.mnList[0].network.name !== validNetwork.name) {
      throw new Error(`votingAddress network is not equal to ${validNetwork.name}`);
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
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromJSON = function fromJSON(diffJSON) {
  const cbTxMerkleTree = new PartialMerkleTree();
  cbTxMerkleTree.totalTransactions = diffJSON.cbTxMerkleTree.totalTransactions;
  cbTxMerkleTree.merkleHashes = diffJSON.cbTxMerkleTree.merkleHashes;
  cbTxMerkleTree.merkleFlags = diffJSON.cbTxMerkleTree.merkleFlags;

  return SimplifiedMNListDiff.fromObject({
    ...diffJSON, cbTxMerkleTree,
  }, Networks.get(diffJSON.network.name));
};

SimplifiedMNListDiff.prototype.toObject = function toObject() {
  const obj = {};
  obj.baseBlockHash = this.baseBlockHash;
  obj.blockHash = this.blockHash;

  /* cbTxMerkleRoot start */
  obj.cbTxMerkleTree = this.cbTxMerkleTree.toString();
  /* cbTxMerkleRoot stop */

  obj.cbTx = this.cbTx.serialize(true);
  // Copy array of strings
  obj.deletedMNs = this.deletedMNs.slice();
  obj.mnList = this.mnList.map(SMLEntry => SMLEntry.toObject());
  obj.deletedQuorums = this.deletedQuorums.slice();
  obj.newQuorums = this.newQuorums.map(SMLEntry => SMLEntry.toObject());
  obj.merkleRootMNList = this.merkleRootMNList;
  if (this.merkleRootQuorums) {
    obj.merkleRootQuorums = this.merkleRootQuorums;
  }

  return obj;
};

SimplifiedMNListDiff.prototype.copy = function copy() {
  return SimplifiedMNListDiff.fromBuffer(this.toBuffer(), this.network);
};

module.exports = SimplifiedMNListDiff;
