const { isObject, isString } = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const constants = require('../constants');
const doubleSha256 = require('../crypto/hash').sha256sha256;

const { isHexaString, isUnsignedInteger, isHexStringOfSize } = require('../util/js');

const { SHA256_HASH_SIZE, BLS_SIGNATURE_SIZE } = constants;
const bls = require('../crypto/bls');

/**
 * Instantiate a InstantLock from a Buffer, hex string, JSON object / Object with the properties
 * of the InstantLock.
 *
 * @class InstantLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object
 * representing a InstantLock
 * @property {number} height
 * @property {Buffer} blockHash
 * @property {Buffer} signature
 */
class InstantLock {
  constructor(arg) {
    if (arg instanceof InstantLock) {
      return arg.copy();
    }
    const info = InstantLock._from(arg);

    this.height = info.height;
    this.blockHash = info.blockHash;
    this.signature = info.signature;

    return this;
  }

  static get CLSIG_REQUESTID_PREFIX() {
    return 'inlock';
  }

  /**
   * @param {Buffer|Object|string} arg - A Buffer, JSON string or Object
   * @returns {Object} - An object representing instantlock data
   * @throws {TypeError} - If the argument was not recognized
   * @private
   */
  static _from(arg) {
    let info = {};
    if (BufferUtil.isBuffer(arg)) {
      info = InstantLock._fromBufferReader(BufferReader(arg));
    } else if (isObject(arg)) {
      info = InstantLock._fromObject(arg);
    } else if (isHexaString(arg)) {
      info = InstantLock.fromHex(arg);
    } else {
      throw new TypeError('Unrecognized argument for InstantLock');
    }
    return info;
  }

  static _fromObject(data) {
    $.checkArgument(data, 'data is required');
    let blockHash = data.blockHash || data.blockhash;
    let { signature } = data;
    if (isString(blockHash)) {
      blockHash = BufferUtil.reverse(Buffer.from(blockHash, 'hex'));
    }

    if (isString(data.signature)) {
      signature = Buffer.from(data.signature, 'hex');
    }
    return {
      height: data.height,
      blockHash,
      signature,
    };
  }

  /**
   * @param {BufferReader} br - Chainlock data
   * @returns {Object} - An object representing the instantlock data
   * @private
   */
  static _fromBufferReader(br) {
    const info = {};
    info.height = br.readInt32LE();
    info.blockHash = br.read(SHA256_HASH_SIZE);
    info.signature = br.read(BLS_SIGNATURE_SIZE);
    return info;
  }

  /**
   * @param {BufferReader} br A buffer reader of the block
   * @returns {InstantLock} - An instance of InstantLock
   */
  static fromBufferReader(br) {
    $.checkArgument(br, 'br is required');
    const data = InstantLock._fromBufferReader(br);
    return new InstantLock(data);
  }

  /**
   * Creates InstantLock from a hex string.
   * @param {String} string - A hex string representation of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromString(string) {
    return InstantLock.fromBuffer(Buffer.from(string, 'hex'));
  }

  /**
   * Creates InstantLock from a hex string.
   * @param {String} string - A hex string representation of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromHex(string) {
    return InstantLock.fromBuffer(Buffer.from(string, 'hex'));
  }

  /**
   * Creates InstantLock from a Buffer.
   * @param {Buffer} buffer - A buffer of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromBuffer(buffer) {
    return InstantLock.fromBufferReader(new BufferReader(buffer));
  }

  /**
   * Create InstantLock from an object
   * @param {Object} obj - an object with all properties of instantlock
   * @return {InstantLock}
   */
  static fromObject(obj) {
    const data = InstantLock._fromObject(obj);
    return new InstantLock(data);
  }

  /**
   * Verify that the signature is valid against the Quorum using quorumPublicKey
   * @private
   * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
   * @returns {Promise<Boolean>} - returns the result of the signature verification
   */
  async verifySignatureAgainstQuorum(quorumEntry) {
    const { signature } = this;
    const { quorumPublicKey } = quorumEntry;
    const signHash = this.getSignHashForQuorumEntry(quorumEntry);

    const blsInstance = await bls.getInstance();

    const quorumPubKey = blsInstance.PublicKey.fromBytes(Buffer.from(quorumPublicKey, 'hex'));

    const aggregationInfo = blsInstance.AggregationInfo.fromMsgHash(quorumPubKey, signHash);
    const thresholdSignature = blsInstance.Signature.fromBytes(Buffer.from(signature, 'hex'));

    thresholdSignature.setAggregationInfo(aggregationInfo);

    return thresholdSignature.verify();
  }

  /**
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {number} offset - starting height offset to identify the signatory
   * @returns {Promise<Boolean>}
   */
  async verifySignatureWithQuorumOffset(smlStore, offset) {
    const requestId = this.getRequestId();
    const candidateSignatoryQuorum = this.selectSignatoryQuorum(smlStore, requestId, offset);

    // Logic taken from dashsync-iOS
    // https://github.com/dashevo/dashsync-iOS/blob/master/DashSync/Models/Chain/DSInstantLock.m#L148-L185
    // first try with default offset
    let result = await this.verifySignatureAgainstQuorum(candidateSignatoryQuorum);

    // second try with 0 offset, else with double offset
    if (!result && offset === constants.LLMQ_SIGN_HEIGHT_OFFSET) {
      result = await this.verifySignatureWithQuorumOffset(smlStore, 0);
    } else if (!result && offset === 0) {
      result = await this.verifySignatureWithQuorumOffset(
        smlStore, constants.LLMQ_SIGN_HEIGHT_OFFSET * 2,
      );
    }

    return result;
  }

  /**
   * Verifies that the signature is valid
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @returns {Promise<Boolean>} - returns the result of the verification
   */
  async verify(smlStore) {
    return this.verifySignatureWithQuorumOffset(smlStore, constants.LLMQ_SIGN_HEIGHT_OFFSET);
  }

  /**
   * Validate InstantLock structure
   */
  validate() {
    $.checkArgument(isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
    $.checkArgument(isHexStringOfSize(this.blockHash.toString('hex'), SHA256_HASH_SIZE * 2), `Expected blockhash to be a hex string of size ${SHA256_HASH_SIZE}`);
    $.checkArgument(isHexStringOfSize(this.signature.toString('hex'), BLS_SIGNATURE_SIZE * 2), 'Expected signature to be a bls signature');
  }

  /**
   * Returns InstantLock hash
   * @returns {Buffer}
   */
  getHash() {
    return doubleSha256(this.toBuffer()).reverse();
  }

  /**
   * Computes the request ID for this InstantLock
   * @returns {Buffer} - Request id for this instantlock
   */
  getRequestId() {
    const bufferWriter = new BufferWriter();

    const prefix = InstantLock.CLSIG_REQUESTID_PREFIX;
    const prefixLength = prefix.length;

    bufferWriter.writeVarintNum(prefixLength);
    bufferWriter.write(Buffer.from(prefix, 'utf-8'));
    bufferWriter.writeUInt32LE(this.height);

    // Double-sha is used to protect from extension attacks.
    return doubleSha256(bufferWriter.toBuffer()).reverse();
  }

  /**
   * Selects the correct quorum that signed this InstantLock
   * msgHash
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry} - signatoryQuorum
   */
  selectSignatoryQuorum(smlStore, requestId, offset) {
    const instantlockSML = smlStore.getSMLbyHeight(this.height - offset);
    const scoredQuorums = instantlockSML.calculateSignatoryQuorumScores(
      instantlockSML.getChainlockLLMQType(), requestId,
    );

    scoredQuorums.sort((a, b) => Buffer.compare(a.score, b.score));
    return scoredQuorums[0].quorum;
  }

  /**
   * Computes signature id for a quorum entry
   * @param {QuorumEntry} quorumEntry
   * @returns {Buffer} - Signature id for this requestId and quorum.
   */
  getSignHashForQuorumEntry(quorumEntry) {
    const { llmqType, quorumHash } = quorumEntry;
    const requestID = this.getRequestId();
    const { blockHash } = this;

    const bufferWriter = new BufferWriter();
    bufferWriter.writeUInt8(llmqType);
    bufferWriter.writeReverse(Buffer.from(quorumHash, 'hex'));
    bufferWriter.writeReverse(requestID);
    bufferWriter.write(blockHash);
    return doubleSha256(bufferWriter.toBuffer());
  }

  /**
   * Serializes InstantLock to JSON
   * @returns {Object} A plain object with the instantlock information
   */
  toObject() {
    return {
      height: this.height,
      blockHash: BufferUtil.reverse(this.blockHash).toString('hex'),
      signature: this.signature.toString('hex'),
    };
  }

  /**
   * Serializes instantlock to JSON
   * @returns {Object} A plain object with the instantlock information
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * Serialize InstantLock
   * @returns {string} - A hex encoded string of the instantlock
   */
  toString() {
    return this.toBuffer().toString('hex');
  }

  /**
   * Serialize InstantLock to buffer
   * @return {Buffer}
   */
  toBuffer() {
    return this.toBufferWriter().toBuffer();
  }

  /**
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the InstantLock
   */
  toBufferWriter(bw) {
    const bufferWriter = bw || new BufferWriter();
    bufferWriter.writeInt32LE(this.height);
    bufferWriter.write(this.blockHash);
    bufferWriter.write(this.signature);
    return bufferWriter;
  }

  /**
   * Creates a copy of InstantLock
   * @return {InstantLock} - a new copy instance of InstantLock
   */
  copy() {
    return InstantLock.fromBuffer(this.toBuffer());
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} InstantLock block hash and height
   */
  inspect() {
    const reversedBlockHash = BufferUtil.reverse(this.blockHash).toString('hex');
    return `<InstantLock: ${reversedBlockHash}, height: ${this.height}>`;
  }
}

module.exports = InstantLock;
