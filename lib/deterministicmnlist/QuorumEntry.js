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
  readExact,
  readExactReverse,
  readCompactSize,
} = require('../transaction/payload/strictpayloadreader');

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
 * @param {Object} [llmqParamsOverride] - LLMQ type override
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
function QuorumEntry(arg, llmqParamsOverride = {}) {
  if (arg) {
    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (BufferUtil.isBuffer(arg)) {
      return QuorumEntry.fromBuffer(arg, llmqParamsOverride);
    }

    if (_.isObject(arg)) {
      return QuorumEntry.fromObject(arg, llmqParamsOverride);
    }

    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (isHexString(arg)) {
      return QuorumEntry.fromHexString(arg, llmqParamsOverride);
    }
    throw new TypeError('Unrecognized argument for QuorumEntry');
  }
}

/**
 * Reads the fields that precede a commitment's bit sets
 * @param {BufferReader} bufferReader
 * @return {{version: number, llmqType: number, quorumHash: string, quorumIndex: number}}
 */
function readCommitmentHead(bufferReader) {
  const version = bufferReader.readUInt16LE();
  return {
    version,
    llmqType: bufferReader.readUInt8(),
    quorumHash: readExactReverse(bufferReader, SHA256_HASH_SIZE).toString('hex'),
    quorumIndex: isHashQuorumIndexRequired(version) ? bufferReader.readInt16LE() : 0,
  };
}

/**
 * Reads the fields that follow a commitment's bit sets
 * @param {BufferReader} bufferReader
 * @return {{quorumPublicKey: string, quorumVvecHash: string, quorumSig: string,
 * membersSig: string}}
 */
function readCommitmentTail(bufferReader) {
  return {
    quorumPublicKey: readExact(bufferReader, BLS_PUBLIC_KEY_SIZE).toString('hex'),
    quorumVvecHash: readExactReverse(bufferReader, SHA256_HASH_SIZE).toString('hex'),
    quorumSig: readExact(bufferReader, BLS_SIGNATURE_SIZE).toString('hex'),
    membersSig: readExact(bufferReader, BLS_SIGNATURE_SIZE).toString('hex'),
  };
}

/**
 * Parse buffer and returns QuorumEntry
 * @param {Buffer} buffer
 * @param {Object} [llmqParamsOverride]
 * @return {QuorumEntry}
 */
QuorumEntry.fromBuffer = function fromBuffer(buffer, llmqParamsOverride = {}) {
  const bufferReader = new BufferReader(buffer);
  const SMLQuorumEntry = new QuorumEntry();
  SMLQuorumEntry.llmqParamsOverride = llmqParamsOverride;
  SMLQuorumEntry.isVerified = false;
  if (buffer.length < 100) {
    SMLQuorumEntry.isOutdatedRPC = true;
    SMLQuorumEntry.version = bufferReader.readUInt16LE();
    SMLQuorumEntry.llmqType = bufferReader.readUInt8();
    SMLQuorumEntry.quorumHash = bufferReader
      .readReverse(constants.SHA256_HASH_SIZE)
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
  Object.assign(SMLQuorumEntry, readCommitmentHead(bufferReader));

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
  Object.assign(SMLQuorumEntry, readCommitmentTail(bufferReader));

  return SMLQuorumEntry;
};

/**
 * Whether the unused high bits of a bit set's last byte are set, which Core's
 * ReadFixedBitSet rejects
 * @param {Buffer} bytes
 * @param {number} size - number of bits
 * @return {boolean}
 */
function hasOutOfRangeBits(bytes, size) {
  const unused = bytes.length * 8 - size;
  // eslint-disable-next-line no-bitwise
  return unused > 0 && (bytes[bytes.length - 1] & ~(0xff >>> unused) & 0xff) !== 0;
}

/**
 * Checks a bit set before it is written after the LLMQ size: a wrong length
 * would shift every field that follows, and Core rejects bits past the size
 * @param {string} bits - packed bits hex
 * @param {number} size - LLMQ size in bits
 * @param {string} name
 */
function checkBitSet(bits, size, name) {
  $.checkArgument(
    bits.length === Math.ceil(size / 8) * 2,
    `Expected ${name} to have the LLMQ bit set length`
  );
  $.checkArgument(
    !hasOutOfRangeBits(Buffer.from(bits, 'hex'), size),
    'Expected no bits set past the LLMQ size'
  );
}

/**
 * Reads Core's dynamic bit set: its bit count, then the bits packed into bytes
 * @param {BufferReader} bufferReader
 * @param {Object} [params] - LLMQ type params, if known; Core requires the
 * bit count to equal their size
 * @return {{count: number, bits: string}} number of set bits, packed bits hex
 */
function readDynamicBitSet(bufferReader, params) {
  // at most MAX_SIZE bits, and readExact bounds the bytes by the remaining data
  const size = readCompactSize(bufferReader);
  if (params && size !== params.size) {
    throw new Error(`Expected a bit set of ${params.size} bits, got ${size}`);
  }
  const bytes = readExact(bufferReader, Math.ceil(size / 8));
  if (hasOutOfRangeBits(bytes, size)) {
    throw new Error('Out-of-range bits set');
  }
  let count = 0;
  bytes.forEach((byte) => {
    // clear the lowest set bit until none is left: at most 8 steps per byte
    for (let bits = byte; bits !== 0; count += 1) {
      // eslint-disable-next-line no-bitwise
      bits &= bits - 1;
    }
  });
  return { count, bits: bytes.toString('hex') };
}

/**
 * Reads a final commitment as Core sends it in the P2P `mnlistdiff` message,
 * the layout toBufferForHashing() writes. Like Core's RPC, signersCount and
 * validMembersCount are the numbers of set bits.
 * @param {BufferReader} bufferReader
 * @param {Object} [llmqParamsOverride]
 * @return {QuorumEntry}
 */
QuorumEntry.fromP2PBufferReader = function fromP2PBufferReader(
  bufferReader,
  llmqParamsOverride = {}
) {
  const obj = readCommitmentHead(bufferReader);

  // Unknown types are read without the size check, but can't be serialized
  const params = _.merge({}, constants.LLMQ_TYPE_PARAMS, llmqParamsOverride)[obj.llmqType];
  const signers = readDynamicBitSet(bufferReader, params);
  obj.signersCount = signers.count;
  obj.signers = signers.bits;
  const validMembers = readDynamicBitSet(bufferReader, params);
  obj.validMembersCount = validMembers.count;
  obj.validMembers = validMembers.bits;
  Object.assign(obj, readCommitmentTail(bufferReader));

  return QuorumEntry.fromObject(obj, llmqParamsOverride);
};

/**
 * @param {string} string
 * @param {Object} llmqParamsOverride
 * @return {QuorumEntry}
 */
QuorumEntry.fromHexString = function fromString(string, llmqParamsOverride = {}) {
  return QuorumEntry.fromBuffer(Buffer.from(string, 'hex'), llmqParamsOverride);
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
  checkBitSet(this.signers, fixedCounterLength, 'signers');
  checkBitSet(this.validMembers, fixedCounterLength, 'validMembers');
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
 * @param {Object} llmqParamsOverride
 * @return {QuorumEntry}
 */
QuorumEntry.fromObject = function fromObject(obj, llmqParamsOverride = {}) {
  const SMLQuorumEntry = new QuorumEntry();
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

  SMLQuorumEntry.llmqParamsOverride = llmqParamsOverride;

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

QuorumEntry.getParams = function getParams(llmqType, llmqParamsOverride = {}) {
  let llmqParams = constants.LLMQ_TYPE_PARAMS;
  if (Object.keys(llmqParamsOverride).length > 0) {
    llmqParams = _.merge({}, constants.LLMQ_TYPE_PARAMS, llmqParamsOverride);
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
  return QuorumEntry.getParams(this.llmqType, this.llmqParamsOverride);
};

/**
 * Serialize quorum entry commitment to buf
 * This is the message hash signed by the quorum for verification
 * @return {Uint8Array}
 */
QuorumEntry.prototype.getCommitmentHash = function getCommitmentHash() {
  const { size } = this.getParams();
  checkBitSet(this.validMembers, size, 'validMembers');
  const bufferWriter = new BufferWriter();
  bufferWriter.writeUInt8(this.llmqType);
  bufferWriter.write(Buffer.from(this.quorumHash, 'hex').reverse());
  bufferWriter.writeVarintNum(size);
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
  // fromBuffer needs the params of custom quorum types for the bit set sizes
  return QuorumEntry.fromBuffer(this.toBuffer(), this.llmqParamsOverride);
};

module.exports = QuorumEntry;
