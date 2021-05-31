const { isObject, isString } = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const constants = require('../constants');
const doubleSha256 = require('../crypto/hash').sha256sha256;

const {
  isHexaString,
  isUnsignedInteger,
  isHexStringOfSize,
} = require('../util/js');

const { SHA256_HASH_SIZE, BLS_SIGNATURE_SIZE } = constants;
const bls = require('../crypto/bls');

/**
 * Instantiate a ChainLock from a Buffer, hex string, JSON object / Object with the properties
 * of the ChainLock.
 *
 * @class ChainLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object
 * representing a ChainLock
 * @property {number} height
 * @property {Buffer} blockHash
 * @property {Buffer} signature
 */
class ChainLock {
  constructor(arg) {
    if (arg instanceof ChainLock) {
      return arg.copy();
    }
    const info = ChainLock._from(arg);

    this.height = info.height;
    this.blockHash = info.blockHash;
    this.signature = info.signature;

    return this;
  }

  static get CLSIG_REQUESTID_PREFIX() {
    return 'clsig';
  }

  /**
   * @param {Buffer|Object|string} arg - A Buffer, JSON string or Object
   * @returns {Object} - An object representing chainlock data
   * @throws {TypeError} - If the argument was not recognized
   * @private
   */
  static _from(arg) {
    let info = {};
    if (BufferUtil.isBuffer(arg)) {
      info = ChainLock._fromBufferReader(BufferReader(arg));
    } else if (isObject(arg)) {
      info = ChainLock._fromObject(arg);
    } else if (isHexaString(arg)) {
      info = ChainLock.fromHex(arg);
    } else {
      throw new TypeError('Unrecognized argument for ChainLock');
    }
    return info;
  }

  static _fromObject(data) {
    $.checkArgument(data, 'data is required');
    let blockHash = data.blockHash || data.blockhash;
    let { signature } = data;
    if (isString(blockHash)) {
      blockHash = Buffer.from(blockHash, 'hex');
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
   * @returns {Object} - An object representing the chainlock data
   * @private
   */
  static _fromBufferReader(br) {
    const info = {};
    info.height = br.readInt32LE();
    info.blockHash = br.readReverse(SHA256_HASH_SIZE);
    info.signature = br.read(BLS_SIGNATURE_SIZE);
    return info;
  }

  /**
   * @param {BufferReader} br A buffer reader of the block
   * @returns {ChainLock} - An instance of ChainLock
   */
  static fromBufferReader(br) {
    $.checkArgument(br, 'br is required');
    const data = ChainLock._fromBufferReader(br);
    return new ChainLock(data);
  }

  /**
   * Creates ChainLock from a hex string.
   * @param {String} string - A hex string representation of the chainLock
   * @return {ChainLock} - An instance of ChainLock
   */
  static fromString(string) {
    return ChainLock.fromBuffer(Buffer.from(string, 'hex'));
  }

  /**
   * Creates ChainLock from a hex string.
   * @param {String} string - A hex string representation of the chainLock
   * @return {ChainLock} - An instance of ChainLock
   */
  static fromHex(string) {
    return ChainLock.fromString(string);
  }

  /**
   * Creates ChainLock from a Buffer.
   * @param {Buffer} buffer - A buffer of the chainLock
   * @return {ChainLock} - An instance of ChainLock
   */
  static fromBuffer(buffer) {
    return ChainLock.fromBufferReader(new BufferReader(buffer));
  }

  /**
   * Create ChainLock from an object
   * @param {Object} obj - an object with all properties of chainlock
   * @return {ChainLock}
   */
  static fromObject(obj) {
    const data = ChainLock._fromObject(obj);
    return new ChainLock(data);
  }

  /**
   * Verify that the signature is valid against the Quorum using quorumPublicKey
   * @private
   * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
   * @param {Buffer} requestId
   * @returns {Promise<Boolean>} - returns the result of the signature verification
   */
  async verifySignatureAgainstQuorum(quorumEntry, requestId) {
    return bls.verifySignature(
      this.signature.toString('hex'),
      this.getSignHashForQuorumEntry(quorumEntry, requestId),
      quorumEntry.quorumPublicKey
    );
  }

  /**
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset - starting height offset to identify the signatory
   * @returns {Promise<Boolean>}
   */
  async verifySignatureWithQuorumOffset(smlStore, requestId, offset) {
    const candidateSignatoryQuorum = this.selectSignatoryQuorum(
      smlStore,
      requestId,
      offset
    );
    let result = false;

    if (candidateSignatoryQuorum !== null) {
      // Logic taken from dashsync-iOS
      // https://github.com/dashevo/dashsync-iOS/blob/master/DashSync/Models/Chain/DSChainLock.m#L148-L185
      // first try with default offset
      result = await this.verifySignatureAgainstQuorum(
        candidateSignatoryQuorum,
        requestId
      );
    }

    // second try with 0 offset, else with double offset
    if (!result && offset === constants.LLMQ_SIGN_HEIGHT_OFFSET) {
      result = await this.verifySignatureWithQuorumOffset(
        smlStore,
        requestId,
        0
      );
    } else if (!result && offset === 0) {
      result = await this.verifySignatureWithQuorumOffset(
        smlStore,
        requestId,
        constants.LLMQ_SIGN_HEIGHT_OFFSET * 2
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
    const requestId = this.getRequestId();
    return this.verifySignatureWithQuorumOffset(
      smlStore,
      requestId,
      constants.LLMQ_SIGN_HEIGHT_OFFSET
    );
  }

  /**
   * Validate Chainlock structure
   */
  validate() {
    $.checkArgument(
      isUnsignedInteger(this.height),
      'Expect height to be an unsigned integer'
    );
    $.checkArgument(
      isHexStringOfSize(this.blockHash.toString('hex'), SHA256_HASH_SIZE * 2),
      `Expected blockhash to be a hex string of size ${SHA256_HASH_SIZE}`
    );
    $.checkArgument(
      isHexStringOfSize(this.signature.toString('hex'), BLS_SIGNATURE_SIZE * 2),
      'Expected signature to be a bls signature'
    );
  }

  /**
   * Returns chainLock hash
   * @returns {Buffer}
   */
  getHash() {
    return doubleSha256(this.toBuffer());
  }

  /**
   * Computes the request ID for this ChainLock
   * @returns {Buffer} - Request id for this chainlock
   */
  getRequestId() {
    const bufferWriter = new BufferWriter();

    const prefix = ChainLock.CLSIG_REQUESTID_PREFIX;
    const prefixLength = prefix.length;

    bufferWriter.writeVarintNum(prefixLength);
    bufferWriter.write(Buffer.from(prefix, 'utf-8'));
    bufferWriter.writeUInt32LE(this.height);

    // Double-sha is used to protect from extension attacks.
    return doubleSha256(bufferWriter.toBuffer()).reverse();
  }

  /**
   * Selects the correct quorum that signed this ChainLock
   * msgHash
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry|null} - signatoryQuorum
   */
  selectSignatoryQuorum(smlStore, requestId, offset) {
    const chainlockSML = smlStore.getSMLbyHeight(this.height - offset);
    const scoredQuorums = chainlockSML.calculateSignatoryQuorumScores(
      chainlockSML.getChainlockLLMQType(),
      requestId
    );

    if (scoredQuorums.length === 0) {
      return null;
    }

    scoredQuorums.sort((a, b) => Buffer.compare(a.score, b.score));
    return scoredQuorums[0].quorum;
  }

  /**
   * Computes signature id for a quorum entry
   * @param {QuorumEntry} quorumEntry
   * @param {Buffer} requestId
   * @returns {Buffer} - Signature id for this requestId and quorum.
   */
  getSignHashForQuorumEntry(quorumEntry, requestId) {
    const { llmqType, quorumHash } = quorumEntry;
    const { blockHash } = this;

    const bufferWriter = new BufferWriter();
    bufferWriter.writeUInt8(llmqType);
    bufferWriter.writeReverse(Buffer.from(quorumHash, 'hex'));
    bufferWriter.writeReverse(requestId);
    bufferWriter.writeReverse(blockHash);
    return doubleSha256(bufferWriter.toBuffer());
  }

  /**
   * Serializes chainlock to JSON
   * @returns {Object} A plain object with the chainlock information
   */
  toObject() {
    return {
      height: this.height,
      blockHash: this.blockHash.toString('hex'),
      signature: this.signature.toString('hex'),
    };
  }

  /**
   * Serializes chainlock to JSON
   * @returns {Object} A plain object with the chainlock information
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * Serialize ChainLock
   * @returns {string} - A hex encoded string of the chainlock
   */
  toString() {
    return this.toBuffer().toString('hex');
  }

  /**
   * Serialize ChainLock to buffer
   * @return {Buffer}
   */
  toBuffer() {
    return this.toBufferWriter().toBuffer();
  }

  /**
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the ChainLock
   */
  toBufferWriter(bw) {
    const bufferWriter = bw || new BufferWriter();
    bufferWriter.writeInt32LE(this.height);
    bufferWriter.write(Buffer.from(this.blockHash).reverse());
    bufferWriter.write(this.signature);
    return bufferWriter;
  }

  /**
   * Creates a copy of ChainLock
   * @return {ChainLock} - a new copy instance of ChainLock
   */
  copy() {
    return ChainLock.fromBuffer(this.toBuffer());
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} ChainLock block hash and height
   */
  inspect() {
    return `<ChainLock: ${this.blockHash.toString('hex')}, height: ${
      this.height
    }>`;
  }
}

module.exports = ChainLock;
