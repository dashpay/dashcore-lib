const _ = require('lodash');
const $ = require('../util/preconditions');
const BitArray = require('../util/bitarray');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const constants = require('../constants');
const Hash = require('../crypto/hash');
const bls = require('../crypto/bls');
const utils = require('../util/js');
const isHashQuorumIndexRequired = require('../util/isHashQuorumIndexRequired');

const {
  isHexStringOfSize,
  isUnsignedInteger,
  isSha256HexString: isSha256,
  isHexaString: isHexString,
} = utils;

const {
  BLS_PUBLIC_KEY_SIZE,
  BLS_SIGNATURE_SIZE,
  SHA256_HASH_SIZE,
} = constants;

/**
 * @typedef {Object} SMLQuorumEntry
 * @property {number} version
 * @property {number} llmqType
 * @property {string} quorumHash
 * @property {number} [quorumIndex]
 * @property {number} signersCount
 * @property {string} signers
 * @property {number} validMembersCount
 * @property {string} validMembers
 * @property {string} quorumPublicKey
 * @property {string} quorumVvecHash
 * @property {string} quorumSig
 * @property {string} membersSig
 */

/**
 * @class QuorumEntry
 * @param {string|Object|Buffer} [arg] - A Buffer, JSON string,
 * or Object representing a SMLQuorumEntry
 * @param {Object} [llmqOverride] - LLMQ type override
 * @constructor
 * @property {number} version
 * @property {number} llmqType
 * @property {string} quorumHash
 * @property {number} [quorumIndex]
 * @property {number} signersCount
 * @property {string} signers
 * @property {number} validMembersCount
 * @property {string} validMembers
 * @property {string} quorumPublicKey
 * @property {string} quorumVvecHash
 * @property {string} quorumSig
 * @property {string} membersSig
 */
function QuorumEntry(arg, llmqOverride = {}) {
  if (arg) {
    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (BufferUtil.isBuffer(arg)) {
      return QuorumEntry.fromBuffer(arg, llmqOverride);
    }

    if (_.isObject(arg)) {
      return QuorumEntry.fromObject(arg, llmqOverride);
    }

    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (isHexString(arg)) {
      return QuorumEntry.fromHexString(arg, llmqOverride);
    }
    throw new TypeError('Unrecognized argument for QuorumEntry');
  }
}

/**
 * Parse buffer and returns QuorumEntry
 * @param {Buffer} buffer
 * @param {Object} [llmqOverride]
 * @return {QuorumEntry}
 */
QuorumEntry.fromBuffer = function fromBuffer(buffer, llmqOverride = {}) {
  const bufferReader = new BufferReader(buffer);
  const SMLQuorumEntry = new QuorumEntry({ }, llmqOverride);
  SMLQuorumEntry.isVerified = false;
  if (buffer.length < 100) {
    SMLQuorumEntry.isOutdatedRPC = true;
    SMLQuorumEntry.version = bufferReader.readUInt16LE();
    SMLQuorumEntry.llmqType = bufferReader.readUInt8();
    SMLQuorumEntry.quorumHash = bufferReader
      .read(constants.SHA256_HASH_SIZE)
      .reverse()
      .toString('hex');

    if (isHashQuorumIndexRequired(this.version)) {
      SMLQuorumEntry.quorumIndex = buffer.readInt16LE();
    } else {
      SMLQuorumEntry.quorumIndex = 0;
    }

    SMLQuorumEntry.signersCount = bufferReader.readVarintNum();
    SMLQuorumEntry.validMembersCount = bufferReader.readVarintNum();
    SMLQuorumEntry.quorumPublicKey = bufferReader
      .read(BLS_PUBLIC_KEY_SIZE)
      .toString('hex');

    return SMLQuorumEntry;
  }
  SMLQuorumEntry.isOutdatedRPC = false;
  SMLQuorumEntry.version = bufferReader.readUInt16LE();
  SMLQuorumEntry.llmqType = bufferReader.readUInt8();
  SMLQuorumEntry.quorumHash = bufferReader
    .read(constants.SHA256_HASH_SIZE)
    .reverse()
    .toString('hex');

  if (isHashQuorumIndexRequired(SMLQuorumEntry.version)) {
    SMLQuorumEntry.quorumIndex = bufferReader.readInt16LE();
  } else {
    SMLQuorumEntry.quorumIndex = 0;
  }

  SMLQuorumEntry.signersCount = bufferReader.readVarintNum();
  const signersBytesToRead =
    Math.floor((SMLQuorumEntry.getParams().size + 7) / 8) || 1;
  SMLQuorumEntry.signers = bufferReader
    .read(signersBytesToRead)
    .toString('hex');
  SMLQuorumEntry.validMembersCount = bufferReader.readVarintNum();
  const validMembersBytesToRead =
    Math.floor((SMLQuorumEntry.getParams().size + 7) / 8) || 1;
  SMLQuorumEntry.validMembers = bufferReader
    .read(validMembersBytesToRead)
    .toString('hex');
  SMLQuorumEntry.quorumPublicKey = bufferReader
    .read(BLS_PUBLIC_KEY_SIZE)
    .toString('hex');
  SMLQuorumEntry.quorumVvecHash = bufferReader
    .read(SHA256_HASH_SIZE)
    .reverse()
    .toString('hex');
  SMLQuorumEntry.quorumSig = bufferReader
    .read(BLS_SIGNATURE_SIZE)
    .toString('hex');
  SMLQuorumEntry.membersSig = bufferReader
    .read(BLS_SIGNATURE_SIZE)
    .toString('hex');

  return SMLQuorumEntry;
};

/**
 * @param {string} string
 * @param {Object} llmqOverride
 * @return {QuorumEntry}
 */
QuorumEntry.fromHexString = function fromString(string, llmqOverride = {}) {
  return QuorumEntry.fromBuffer(Buffer.from(string, 'hex'), llmqOverride);
};

/**
 * Serialize SML entry to buf
 * @return {Buffer}
 */
QuorumEntry.prototype.toBuffer = function toBuffer() {
  this.validate();
  const bufferWriter = new BufferWriter();

  bufferWriter.writeUInt16LE(this.version);
  bufferWriter.writeUInt8(this.llmqType);
  bufferWriter.write(Buffer.from(this.quorumHash, 'hex').reverse());

  if (isHashQuorumIndexRequired(this.version)) {
    bufferWriter.writeInt16LE(this.quorumIndex);
  }

  bufferWriter.writeVarintNum(this.signersCount);

  if (this.isOutdatedRPC) {
    bufferWriter.writeVarintNum(this.validMembersCount);
    bufferWriter.write(Buffer.from(this.quorumPublicKey, 'hex'));

    return bufferWriter.toBuffer();
  }

  bufferWriter.write(Buffer.from(this.signers, 'hex'));
  bufferWriter.writeVarintNum(this.validMembersCount);
  bufferWriter.write(Buffer.from(this.validMembers, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumPublicKey, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumVvecHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.quorumSig, 'hex'));
  bufferWriter.write(Buffer.from(this.membersSig, 'hex'));

  return bufferWriter.toBuffer();
};

/**
 * Serialize SML entry to buf
 * @return {Buffer}
 */
QuorumEntry.prototype.toBufferForHashing = function toBufferForHashing() {
  this.validate();
  const bufferWriter = new BufferWriter();
  const fixedCounterLength = this.getParams().size;
  bufferWriter.writeUInt16LE(this.version);
  bufferWriter.writeUInt8(this.llmqType);
  bufferWriter.write(Buffer.from(this.quorumHash, 'hex').reverse());

  if (isHashQuorumIndexRequired(this.version)) {
    bufferWriter.writeInt16LE(this.quorumIndex);
  }

  bufferWriter.writeVarintNum(fixedCounterLength);
  bufferWriter.write(Buffer.from(this.signers, 'hex'));
  bufferWriter.writeVarintNum(fixedCounterLength);
  bufferWriter.write(Buffer.from(this.validMembers, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumPublicKey, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumVvecHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.quorumSig, 'hex'));
  bufferWriter.write(Buffer.from(this.membersSig, 'hex'));

  return bufferWriter.toBuffer();
};

/**
 * Create SMLQuorumEntry from an object
 * @param {SMLQuorumEntry} obj
 * @param {Object} llmqOverride
 * @return {QuorumEntry}
 */
QuorumEntry.fromObject = function fromObject(obj, llmqOverride = {}) {
  const SMLQuorumEntry = new QuorumEntry({}, llmqOverride);
  SMLQuorumEntry.isVerified = false;
  SMLQuorumEntry.isOutdatedRPC = false;
  SMLQuorumEntry.version = obj.version;
  SMLQuorumEntry.llmqType = obj.llmqType;
  SMLQuorumEntry.quorumHash = obj.quorumHash;
  SMLQuorumEntry.quorumIndex = obj.quorumIndex;
  SMLQuorumEntry.signersCount = obj.signersCount;
  SMLQuorumEntry.signers = obj.signers;
  SMLQuorumEntry.validMembersCount = obj.validMembersCount;
  SMLQuorumEntry.validMembers = obj.validMembers;
  SMLQuorumEntry.quorumPublicKey = obj.quorumPublicKey;
  SMLQuorumEntry.quorumVvecHash = obj.quorumVvecHash;
  SMLQuorumEntry.quorumSig = obj.quorumSig;
  SMLQuorumEntry.membersSig = obj.membersSig;
  if (SMLQuorumEntry.signers === undefined) {
    SMLQuorumEntry.isOutdatedRPC = true;
  }
  SMLQuorumEntry.validate();
  return SMLQuorumEntry;
};

QuorumEntry.prototype.validate = function validate() {
  $.checkArgument(
    utils.isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );
  $.checkArgument(
    utils.isUnsignedInteger(this.llmqType),
    'Expect llmqType to be an unsigned integer'
  );
  $.checkArgument(
    isSha256(this.quorumHash),
    'Expected quorumHash to be a sha256 hex string'
  );

  if (isHashQuorumIndexRequired(this.version)) {
    $.checkArgument(
      Number.isInteger(this.quorumIndex),
      'Expected quorumIndex to be an integer'
    );
  }

  $.checkArgument(
    isUnsignedInteger(this.signersCount),
    'Expect signersCount to be an unsigned integer'
  );
  $.checkArgument(
    isUnsignedInteger(this.validMembersCount),
    'Expect validMembersCount to be an unsigned integer'
  );
  $.checkArgument(
    isHexStringOfSize(this.quorumPublicKey, BLS_PUBLIC_KEY_SIZE * 2),
    'Expected quorumPublicKey to be a bls pubkey'
  );
  if (!this.isOutdatedRPC) {
    $.checkArgument(
      utils.isHexaString(this.signers),
      'Expect signers to be a hex string'
    );
    $.checkArgument(
      utils.isHexaString(this.validMembers),
      'Expect validMembers to be a hex string'
    );
    $.checkArgument(
      isHexStringOfSize(this.quorumVvecHash, SHA256_HASH_SIZE * 2),
      `Expected quorumVvecHash to be a hex string of size ${SHA256_HASH_SIZE}`
    );
    $.checkArgument(
      isHexStringOfSize(this.quorumSig, BLS_SIGNATURE_SIZE * 2),
      'Expected quorumSig to be a bls signature'
    );
    $.checkArgument(
      isHexStringOfSize(this.membersSig, BLS_SIGNATURE_SIZE * 2),
      'Expected membersSig to be a bls signature'
    );
  }
};

QuorumEntry.prototype.toObject = function toObject() {
  const result = {
    version: this.version,
    llmqType: this.llmqType,
    quorumHash: this.quorumHash,
    signersCount: this.signersCount,
    signers: this.signers,
    validMembersCount: this.validMembersCount,
    validMembers: this.validMembers,
    quorumPublicKey: this.quorumPublicKey,
    quorumVvecHash: this.quorumVvecHash,
    quorumSig: this.quorumSig,
    membersSig: this.membersSig,
  };

  result.quorumIndex = this.quorumIndex;

  return result;
};

QuorumEntry.getParams = function getParams(llmqType, llmqOverride = {}) {
  let llmqParams = constants.LLMQ_TYPE_PARAMS;
  if (Object.keys(llmqOverride).length > 0) {
    llmqParams = _.merge({}, constants.LLMQ_TYPE_PARAMS, llmqOverride);
  }

  if (!llmqParams[llmqType]) {
    throw new Error(`Invalid llmq type ${llmqType}`);
  }

  return llmqParams[llmqType];
};

/**
 * @return {number}
 */
QuorumEntry.prototype.getParams = function getParams() {
  return QuorumEntry.getParams(this.llmqType, this.llmqOverride);
};

/**
 * Serialize quorum entry commitment to buf
 * This is the message hash signed by the quorum for verification
 * @return {Uint8Array}
 */
QuorumEntry.prototype.getCommitmentHash = function getCommitmentHash() {
  const bufferWriter = new BufferWriter();
  bufferWriter.writeUInt8(this.llmqType);
  bufferWriter.write(Buffer.from(this.quorumHash, 'hex').reverse());
  bufferWriter.writeVarintNum(this.getParams().size);
  bufferWriter.write(Buffer.from(this.validMembers, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumPublicKey, 'hex'));
  bufferWriter.write(Buffer.from(this.quorumVvecHash, 'hex').reverse());

  return Hash.sha256sha256(bufferWriter.toBuffer());
};

/**
 * Verifies the quorum's bls threshold signature
 * @return {Promise<boolean>}
 */
QuorumEntry.prototype.isValidQuorumSig = async function isValidQuorumSig() {
  if (this.isOutdatedRPC) {
    throw new Error(
      'Quorum cannot be verified: node running on outdated DashCore version (< 0.16)'
    );
  }

  return bls.verifySignature(
    this.quorumSig,
    Uint8Array.from(this.getCommitmentHash()),
    this.quorumPublicKey
  );
};

/**
 * Verifies the quorum's aggregated operator key signature
 * @param {SimplifiedMNList} mnList - MNList for the block (quorumHash)
 * @return {Promise<boolean>}
 */
QuorumEntry.prototype.isValidMemberSig = async function isValidMemberSig(
  mnList
) {
  if (mnList.blockHash !== this.quorumHash) {
    throw new Error(`Wrong Masternode List for quorum: blockHash
      ${mnList.blockHash} doesn't correspond with quorumHash ${this.quorumHash}`);
  }
  if (this.isOutdatedRPC) {
    throw new Error(
      'Quorum cannot be verified: node running on outdated DashCore version (< 0.16)'
    );
  }

  const quorumMembers = this.getAllQuorumMembers(mnList);
  const publicKeyStrings = quorumMembers.map(
    (quorumMember) => quorumMember.pubKeyOperator
  );

  const signersBits = BitArray.uint8ArrayToBitArray(
    Uint8Array.from(Buffer.from(this.signers, 'hex'))
  );

  return bls.verifyAggregatedSignature(
    this.membersSig,
    Uint8Array.from(this.getCommitmentHash()),
    publicKeyStrings,
    signersBits
  );
};

/**
 * verifies the quorum against the det. MNList that was active
 * when the quorum was starting its DKG session. Two different
 * types of BLS signature verifications are performed:
 * 1. the quorumSig is verified with the quorumPublicKey
 * 2. the quorum members are re-calculated and the memberSig is
 * verified against their aggregated pubKeyOperator values
 * @param {SimplifiedMNList} quorumSMNList - MNList for the block (quorumHash)
 * the quorum was starting its DKG session with
 * @return {Promise<boolean>}
 */
QuorumEntry.prototype.verify = function verify(quorumSMNList) {
  return new Promise((resolve, reject) => {
    if (quorumSMNList.blockHash !== this.quorumHash) {
      return reject(
        new Error(`Wrong Masternode List for quorum: blockHash
      ${quorumSMNList.blockHash} doesn't correspond with quorumHash ${this.quorumHash}`)
      );
    }
    if (this.isOutdatedRPC) {
      return reject(
        new Error(
          'Quorum cannot be verified: node running on outdated DashCore version (< 0.16)'
        )
      );
    }

    // only verify if quorum hasn't already been verified
    if (this.isVerified) {
      return resolve(true);
    }

    return this.isValidMemberSig(quorumSMNList)
      .then((isValidMemberSig) => {
        if (!isValidMemberSig) {
          return false;
        }

        return this.isValidQuorumSig();
      })
      .then((isVerified) => {
        this.isVerified = isVerified;

        resolve(isVerified);
      });
  });
};

/**
 * Get all members for this quorum
 * @param {SimplifiedMNList} SMNList - MNlist for the quorum
 * @return {SimplifiedMNListEntry[]}
 */
QuorumEntry.prototype.getAllQuorumMembers = function getAllQuorumMembers(
  SMNList
) {
  // TODO does not work for dip-0024 llmq type quorums
  // See https://github.com/dashpay/dips/blob/master/dip-0024.md#changes-to-the-initialization-phase
  if (SMNList.blockHash !== this.quorumHash) {
    throw new Error(`Wrong Masternode List for quorum: blockHash
      ${SMNList.blockHash} doesn't correspond with quorumHash ${this.quorumHash}`);
  }

  const onlyHighPerformanceMasternodes = this.llmqType === SMNList.getPlatformLLMQType();

  return SMNList.calculateQuorum(
    this.getSelectionModifier(),
    this.getParams().size,
    onlyHighPerformanceMasternodes,
  );
};

/**
 * Gets the modifier for deterministic sorting of the MNList
 * for quorum member selection
 * @return {Buffer}
 */
QuorumEntry.prototype.getSelectionModifier = function getSelectionModifier() {
  const bufferWriter = new BufferWriter();
  bufferWriter.writeUInt8(this.llmqType);
  bufferWriter.write(Buffer.from(this.quorumHash, 'hex').reverse());
  return Hash.sha256sha256(bufferWriter.toBuffer()).reverse();
};

/**
 * Gets the ordering hash for a requestId
 * @param {string} requestId - the requestId for the signing session to be verified
 * @return {Buffer}
 */
QuorumEntry.prototype.getOrderingHashForRequestId =
  function getOrderingHashForRequestId(requestId) {
    const buf = Buffer.concat([
      Buffer.from(this.llmqType),
      Buffer.from(this.quorumHash, 'hex'),
      Buffer.from(requestId, 'hex'),
    ]);
    return Hash.sha256sha256(buf).reverse();
  };

/**
 * @return {Buffer}
 */
QuorumEntry.prototype.calculateHash = function calculateHash() {
  return Hash.sha256sha256(this.toBufferForHashing()).reverse();
};

/**
 * Creates a copy of QuorumEntry
 * @return {QuorumEntry}
 */
QuorumEntry.prototype.copy = function copy() {
  return QuorumEntry.fromBuffer(this.toBuffer());
};

module.exports = QuorumEntry;
