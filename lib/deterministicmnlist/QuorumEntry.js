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
function QuorumEntry(arg) {
  if (arg) {
    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (BufferUtil.isBuffer(arg)) {
      return QuorumEntry.fromBuffer(arg);
    }

    if (_.isObject(arg)) {
      return QuorumEntry.fromObject(arg);
    }

    if (arg instanceof QuorumEntry) {
      return arg.copy();
    }

    if (isHexString(arg)) {
      return QuorumEntry.fromHexString(arg);
    }
    throw new TypeError('Unrecognized argument for QuorumEntry');
  }
}

/**
 * Parse buffer and returns QuorumEntry
 * @param {Buffer} buffer
 * @return {QuorumEntry}
 */
QuorumEntry.fromBuffer = function fromBuffer(buffer) {
  const bufferReader = new BufferReader(buffer);
  const SMLQuorumEntry = new QuorumEntry();
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
 * @return {QuorumEntry}
 */
QuorumEntry.fromHexString = function fromString(string) {
  return QuorumEntry.fromBuffer(Buffer.from(string, 'hex'));
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
 * @return {QuorumEntry}
 */
QuorumEntry.fromObject = function fromObject(obj) {
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

  if (isHashQuorumIndexRequired(this.version)) {
    result.quorumIndex = this.quorumIndex;
  }

  return result;
};

QuorumEntry.getParams = function getParams(llmqType) {
  const params = {};
  switch (llmqType) {
    case constants.LLMQ_TYPES.LLMQ_TYPE_50_60:
      params.size = 50;
      params.threshold = 30;
      params.maximumActiveQuorumsCount = 24;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_60_75:
      params.size = 60;
      params.threshold = 45;
      params.maximumActiveQuorumsCount = 32;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_400_60:
      params.size = 400;
      params.threshold = 240;
      params.maximumActiveQuorumsCount = 4;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_400_85:
      params.size = 400;
      params.threshold = 340;
      params.maximumActiveQuorumsCount = 4;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_100_67:
      params.size = 100;
      params.threshold = 67;
      params.maximumActiveQuorumsCount = 24;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST:
      params.size = 3;
      params.threshold = 2;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_DEVNET:
      // @todo needs to be removed after 18 upgrade
      if (QuorumEntry.isCore17) {
        params.size = 10;
        params.threshold = 3;
        params.maximumActiveQuorumsCount = 7;
        return params;
      }
      params.size = 12;
      params.threshold = 6;
      params.maximumActiveQuorumsCount = 4;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_TEST_V17:
      params.size = 3;
      params.threshold = 2;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_TEST_DIP0024:
      params.size = 4;
      params.threshold = 2;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TYPE_TEST_INSTANTSEND:
      params.size = 3;
      params.threshold = 2;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_DEVNET_DIP0024:
      params.size = 8;
      params.threshold = 4;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_TEST_PLATFORM:
      params.size = 3;
      params.threshold = 2;
      params.maximumActiveQuorumsCount = 2;
      return params;
    case constants.LLMQ_TYPES.LLMQ_DEVNET_PLATFORM:
      params.size = 12;
      params.threshold = 8;
      params.maximumActiveQuorumsCount = 4;
      return params;
    default:
      throw new Error(`Invalid llmq type ${llmqType}`);
  }
};
/**
 * @return {number}
 */
QuorumEntry.prototype.getParams = function getParams() {
  return QuorumEntry.getParams(this.llmqType);
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
  if (SMNList.blockHash !== this.quorumHash) {
    throw new Error(`Wrong Masternode List for quorum: blockHash
      ${SMNList.blockHash} doesn't correspond with quorumHash ${this.quorumHash}`);
  }
  return SMNList.calculateQuorum(
    this.getSelectionModifier(),
    this.getParams().size
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
 * @todo Remove after Core 18 upgrade
 *
 * @type {boolean}
 */
QuorumEntry.isCore17 = false;

/**
 * Creates a copy of QuorumEntry
 * @return {QuorumEntry}
 */
QuorumEntry.prototype.copy = function copy() {
  return QuorumEntry.fromBuffer(this.toBuffer());
};

// const rawQuorums = [
//   {
//     "version": 3,
//     "llmqType": 100,
//     "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "a4cb3c3d91abdc0139e8117074294e12b5f6f6753b4e9006a2da4de66d556f553fb8de6384d49cf60486f6129b016544",
//     "quorumVvecHash": "fd1a7e34d6c4bcfcc90a3876f3ed33687184557728cf9400dfe662501efdb4e6",
//     "quorumSig": "916bf062e046d060e0cc8e1f670687c5e4b07dbe8cd1f2bd40598d0e013f33e5eb32205ec46fa8c04142ad5cfb455d1a071394420baf6ac67ad149da5905abee76c01555a94d1331cbf9df85a6a11a85be9a6d5817b7b9d6b3db50a5254a0a4f",
//     "membersSig": "85d2ac15f5b77b7be82aff22de5cab155064bc137065d37c43b461049f943e553f0d6e73fafaacaeba74847ea559bcbc19f6b86f11f4d84d7a0e6eb8e4823a821782b5243b7aefaaee1996c9f9ad4bc0f76f14219e539bb049c86479d9e4d6f1",
//     "_hash": "2d638a140e69729f4b508bbfcb4422172983248186906747f11a75131153077a"
//   },
//   {
//     "version": 3,
//     "llmqType": 100,
//     "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "b5babd31d449de42faf3f7c65dda91597fcac0ba7eaf9deaa68a50fc7fa29d8e2e242e35b2daf5d7cb12e951ecdd74bf",
//     "quorumVvecHash": "aa1f14922f5401cfd00d76bf8ccde55e6688bb6d46fa29f42b52011997ff459c",
//     "quorumSig": "8b436a2b30c6c78f581fd40ac9d36607c6a7f7aaf5d9cfe7e9181864d4398c08888fc82e739f0f9ba23c4067a17457b3178eaad3bcfb12ac232709a654313234c5e57df6e85810888ac41be2f7dccaae1868105f38d18fd4ec2d055d8c6564d9",
//     "membersSig": "848e86aaecb529f83f6049ad56fbe630a50d8e5cc45428742c8a5ea34199706e39273664241362401e7abae3bf8eee8a17fbacbaf868c399629cb6fb25443ffd4c02dc3886978217fc6c231aeb2708bae1c715b288c1672588c18d4a9c4fd49e",
//     "_hash": "4fbd5c80bad504a444d489d332a117e518272a671b0b0a2fbee44ee71131e737"
//   },
//   {
//     "version": 3,
//     "llmqType": 102,
//     "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "9005b66a1ff24b02f7531b031893007424b96b1ea297900dec77be02407fe3f31006bf92faa37990eef93ffc59326b42",
//     "quorumVvecHash": "32af0fe97c0fca904b26429c9eff6401854a9c153d92321075942c6336e63b6e",
//     "quorumSig": "8c615dc6cefa673c0edc5caf9dd3a05a4e073ac6cada4bd223dd22ba4e5d2cf954766dea5009f0b1aa43086cbef16dea04ba9068d49b3b8e7ddf35089c78f7b3105bb9791b94b23db481a9b46cf7eef5708a1a84a400dcb7ee0f9fda62cf9d3a",
//     "membersSig": "838a26e9e126f56143c0d1b7857e4a1944dc7af4ff8adb81d23dc6e310281392717eb92c512060bac8ed8ab26aa052010286a9977dbb2fc075501a6fa58146e3803405482d912032e12496816a11b8053c9cb0b1a7c08abd95b37c7e9197910a",
//     "_hash": "2b1c6a61147e6a17ffae0ec4bb91028b88606af7be4ec87153fc550d93c0033a"
//   },
//   {
//     "version": 3,
//     "llmqType": 102,
//     "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "85c29a052798ab2d04276b2b8402467c02377798b73e9fea5bf2f7112a77c657f3eb07cef28736079956df459f06e25a",
//     "quorumVvecHash": "8b896440c6b456d9922260d210f52a8d2a4d42129f23e61d7872fa4e205d9871",
//     "quorumSig": "b0143baac2c0a0c26dfa7cd7045c557d2581ac969f6fe99165161b208f275525079227034d0c3a88dba3c80d03dda30d0a41e589091a31214cf2811f874bc3205db98317a1b75c9fea7f1a377913c3f770d53818b9dcf24cc361a913407c1798",
//     "membersSig": "ae8eb22de43d7027918716c75b256e920d8d842a3ae06955503b9a18558b9df79caf425860b59c01785d5fac9940da6c0c9da51baa0b36c9274d6d0f7ea562f03b1f77706b01dfa7b499ef69a729bb7120683792e340222098fc2b55a47039a3",
//     "_hash": "c7ed620d9c24eafc78d8057b2a68f3bdb16653a6cd94f24ffe5383c565eea9dd"
//   },
//   {
//     "version": 4,
//     "llmqType": 103,
//     "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//     "quorumIndex": 0,
//     "signersCount": 4,
//     "signers": "0f",
//     "validMembersCount": 4,
//     "validMembers": "0f",
//     "quorumPublicKey": "a176ff9596880741135afaae7ff57ef816142a3984f51be112cd39684bc21e7c34fc99d8838cba5bd827e8f991181ae9",
//     "quorumVvecHash": "fe7e88f8e1c977f6ec576bc3c7108767137ffd2c70bbcceb10d4e7dc46644aee",
//     "quorumSig": "b245668edbe4a9714ad88457961f4998666394208e85fc0a2f60adf62b78d801ce336286510c820f21890d69356d5f0a14c4e1b8a1aec5475897329381f0b38ed3be54ad730b01cf4444428233b193c4accbbd505fa873bda16f6bf759693f46",
//     "membersSig": "a19c4c1e0868a08ac467673fa04ead681a5f273c8fdbd4bee9288d5672faeb7cc9d26f9dfd2652fa79fad3ffd59ad1ec10a7e52c8a7fbebd42e13cd5b86412c09e9723d4ef1beef551eb41ab181db10ac666bd75d05b8d1c4624c0da22331ac6",
//     "_hash": "9e675a954f513e3f7d41f15ca8617e52a2c5eec6d376dac0a6f8e513ea7c67e9"
//   },
//   {
//     "version": 4,
//     "llmqType": 103,
//     "quorumHash": "3064da67a2d30946bedad0e0d9b6e4049fa78d6e4707bf3aec8c6ba3eab688d4",
//     "quorumIndex": 1,
//     "signersCount": 4,
//     "signers": "0f",
//     "validMembersCount": 4,
//     "validMembers": "0f",
//     "quorumPublicKey": "a2aa13b48274fc7282275be44a71a75d32946dabb14fc7be170ba068e3a4c42df3751f9e3d6b82cdd300d9d2ddb5dfe0",
//     "quorumVvecHash": "bf1688bf1e769725eeef9a6f5487176920822f25777fdff90add9395cfd961da",
//     "quorumSig": "8cd92c377405ac42bc1f07742317527f1f1387ab416113a5d6757763d6064d40c0af96be558d45d737d0cfd62642ac77197d2959632a56a014382830aaf8106ab13f32da0ea139fc35431e67d198a9d72789fc7fcd7a28c3241a3105511e6517",
//     "membersSig": "a3ab0180100f3e40b72f76659726f71d10ca8c12cdd63ba0cac1e86728dfcefe223ecf5221468da57ad74005172dbbb30cc7b46b69ea0e175cce7c5629911c27810415f543fd184241eeb5757180ef0bd5f73958671eae2da387390b412cfb3d",
//     "_hash": "dc219bd05c2ebbcfb24669348ad64d2e2df4489d9a439b2c1b20cd73fb360677"
//   },
//   {
//     "version": 3,
//     "llmqType": 104,
//     "quorumHash": "7dc4b864ded9d7357562fe100f139a26902f2c9e3bea8f6bca98b86f39470f57",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "8da97873b7c1c28582d04f76d1d7eca0ebb1fa7463105869842e6584aa602d5dfd6e64fc20e3e834da899ec823eb6009",
//     "quorumVvecHash": "ded949aee2e21075af28adc8a83b1ce6c9b4891b254f41fc0099e712954f02d2",
//     "quorumSig": "b0e4f61c95dd888c1fde8c0ca44b897660da7841b77eb595c7a36d1c9cff16cb227ce6d182f10f6beefaec68bc998dd90c3d373895a2b9a66709d41570b226227ad16bd6ad94da3be6e47a7c8ca632e474b871ab91bb479ddefde0fcfe91fd3c",
//     "membersSig": "a3c8e1dee3f38ac4c7bb2b50b3570e3018e9db0bdf014e47caddf5b1a31a23d90030d816644c9984efb54b373df6f9a11566d54f06296dcb870f57b84db46c95f4327c6e39e90b72035f4052a8c4421c112e85cc37962518a3575f4c351288dd",
//     "_hash": "9b66b6ab7b3ee673a394a7cb17b39c33fc078b0268d06e68207b950eb3bcd849"
//   },
//   {
//     "version": 1,
//     "llmqType": 104,
//     "quorumHash": "7adc2609a93446c42b4d47e516a2eb31d8f4e8b9b04817df0eafe9880f18d6f9",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "88f921acfed4c521a767a552e5e88d2339c53acbd82b93cf9f2b7174f45ce0542720da51e8fc39c16c4f6ae8f9710a0c",
//     "quorumVvecHash": "0c79ef244a5bd8d61d007e88cc82768b4a0c7af9ca47fb65d959ea0e12da4404",
//     "quorumSig": "00246e258fc64434b9a1eec923e337b0d6fb557a8ae8688fe0a7e0f866a69912b946bfa8d978d4e1ea81749e8787ac93189c7926047d7e50282c5bfa95ea2ae6b48087b60077f6011961674cf920eed0ec6a732864c553db5110968c0d2f48ed",
//     "membersSig": "1414f4ff42426a520f0fbc48d651f37ca1b17f7e86104bb4037c66c21590b08c729474e1bb868e494c11eb5c82fa61a215d78c89c8cd5ca8df447ed60d76a83d9b82eb474c86ce1f1231d4565d4bab97359f0c5df342c61d6adf805d883269e1",
//     "_hash": "bbb3b74701dd886c7fc0e9259ae8e466c0b8ce7fac5e65fda30fe4bcdcf0bbbf"
//   },
//   {
//     "version": 3,
//     "llmqType": 106,
//     "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "acebd725d48f2c6849949ef4225bb0bfbb329d36a1abaffd92831527d2dae7b66e104b014b1d56e533150f3a39e68ef7",
//     "quorumVvecHash": "c11c125599e9d07583dcac08fa46e387f4cdf07afbf580dab51d5f87e4bf82b4",
//     "quorumSig": "88183e681480923d60aecd5fc9e8115e5a69c0c38bb4c84cd02ce0d3798e0c29ec0ef1ab0d75999ee5ed23c22cb1abb708f8fd62d58ed1f7007d5780853ebe540c50ab103752dfa26d49a7ae93bcf7e2cc30aa31b169fb7c5b3b95378bb2481a",
//     "membersSig": "81d0944f43b2d8121437b0391ec3278bbed2e937749fd7cb9266ed5ed3aa32b4c93307c89e7b1af2592a5675eb0e791107fef366f7f862a7604f6eee30c64084e2a30fc81cd30c252ebcd0bc118975b1bfcf474672741bd05fee8f811ebea61c",
//     "_hash": "6ba9f53ade67980763a1258474a9ed02e656097fecfcea53336eeddace792d15"
//   },
//   {
//     "version": 3,
//     "llmqType": 106,
//     "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//     "quorumIndex": 0,
//     "signersCount": 3,
//     "signers": "07",
//     "validMembersCount": 3,
//     "validMembers": "07",
//     "quorumPublicKey": "a34fbfd901a70a0a3353cbf8f58ef4efd100227ce1347b833f288d3f5cd5451291b958bc5875a48b65af0bbf5509be7f",
//     "quorumVvecHash": "46193832a4cdf47d3044183402a218b51d1141c84e84725a350383ad29d83a55",
//     "quorumSig": "b2cb371e308278df644cb5a0a04b60d488aa2369f16659b1874bed7a8554b8f1b2fd4c5a8068645428a12b56006a38890451bc43eacbe65c35a6d025f94bed2189677b5bb47528f3239f69f04f2eb3b0dba994d8f36020b3f50725d136eec457",
//     "membersSig": "963913504ab0026ba3b7b41f4e54289179b04ed812cff1f4102cd301d40197f3e0a8da091e0b5915b3ef49ebc5100f661142ca047e71aab2c0f07fd6eed627be13788d4b8b1c7b70c5e7d1811d18da21ba2c59a7f5a53aaf83f947ba69cd4405",
//     "_hash": "50dcd3cca90071f366a7755142dcbc8a967c8e66ca867649e40bb5e8e2f3ce0f"
//   }
// ];
//
// rawQuorums.forEach((rawQuorum) => {
//   const quorum = new QuorumEntry(rawQuorum);
//   console.log(quorum.calculateHash().toString('hex'))
//   console.log(rawQuorum._hash)
//   console.log('\n');
// });

module.exports = QuorumEntry;
