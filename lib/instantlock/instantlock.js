const { isObject } = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const constants = require('../constants');
const doubleSha256 = require('../crypto/hash').sha256sha256;

const { isHexaString } = require('../util/js');
const { validateV17, validateV18 } = require('./validation');

const { SHA256_HASH_SIZE, BLS_SIGNATURE_SIZE } = constants;
const bls = require('../crypto/bls');

/**
 * Instantiate a InstantLock from a Buffer, hex string, JSON object / Object with the properties
 * of the InstantLock.
 *
 * @class InstantLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object
 * representing a InstantLock
 * @property {Object[]} inputs - an array of outpoints used as inputs for this tx
 * @property {string} txid
 * @property {string} signature
 */
class InstantLock {
  constructor(arg) {
    if (arg instanceof InstantLock) {
      return arg.copy();
    }
    const info = InstantLock._from(arg);

    this.version = info.version;
    this.inputs = info.inputs;
    this.txid = info.txid;
    this.cyclehash = info.cyclehash;
    this.signature = info.signature;
    this.validate();
    return this;
  }

  static get ISLOCK_REQUESTID_PREFIX() {
    return 'islock';
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
    const txid = data.txid || data.txId;
    const cyclehash = data.cyclehash || data.cycleHash;
    const { signature, version } = data;

    const result = {
      inputs: data.inputs,
      txid,
      signature,
    };

    if (version >= 1) {
      result.version = version;
      result.cyclehash = cyclehash;
    }

    return result;
  }

  /**
   * @param {BufferReader} br - InstantLock data
   * @returns {Object} - An object representing the InstantLock data
   * @private
   */
  static _fromBufferReaderV17(br) {
    const info = {};
    const inputsCount = br.readVarintNum();
    info.inputs = [];
    for (let i = 0; i < inputsCount; i += 1) {
      const outpointHash = br.readReverse(SHA256_HASH_SIZE).toString('hex');
      const outpointIndex = br.readInt32LE();
      const outpoint = { outpointHash, outpointIndex };
      info.inputs.push(outpoint);
    }
    info.txid = br.readReverse(SHA256_HASH_SIZE).toString('hex');
    info.signature = br.read(BLS_SIGNATURE_SIZE).toString('hex');
    return info;
  }

  /**
   * @param {BufferReader} br - InstantLock data
   * @returns {Object} - An object representing the InstantLock data
   * @private
   */
  static _fromBufferReaderV18(br) {
    const info = {};
    info.version = br.readUInt8();
    const inputsCount = br.readVarintNum();
    info.inputs = [];
    for (let i = 0; i < inputsCount; i += 1) {
      const outpointHash = br.readReverse(SHA256_HASH_SIZE).toString('hex');
      const outpointIndex = br.readInt32LE();
      const outpoint = { outpointHash, outpointIndex };
      info.inputs.push(outpoint);
    }
    info.txid = br.readReverse(SHA256_HASH_SIZE).toString('hex');
    info.cyclehash = br.readReverse(SHA256_HASH_SIZE).toString('hex');
    info.signature = br.read(BLS_SIGNATURE_SIZE).toString('hex');
    return info;
  }

  /**
   * @param {BufferReader} br - InstantLock data
   * @returns {Object} - An object representing the InstantLock data
   * @private
   */
  static _fromBufferReader(br) {
    let result;
    try {
      result = InstantLock._fromBufferReaderV18(BufferReader(br.buf))

      // In case InstantLock v17 parsed without errors as InstantLock v18
      validateV18(result);
    } catch (e) {
      result = InstantLock._fromBufferReaderV17(BufferReader(br.buf));
    }

    return result;
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
    return InstantLock.fromString(string);
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
   * @param {Buffer} requestId
   * @returns {Promise<Boolean>} - returns the result of the signature verification
   */
  async verifySignatureAgainstQuorum(quorumEntry, requestId) {
    return bls.verifySignature(
      this.signature,
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
      // https://github.com/dashevo/dashsync-iOS/blob/master/DashSync/Models/Transactions/Base/DSInstantSendTransactionLock.m#L161-L193
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
   * Validate InstantLock structure
   */
  validate() {
    if (this.version >= 1) {
      validateV18(this);
    } else {
      validateV17(this);
    }
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
    const prefix = InstantLock.ISLOCK_REQUESTID_PREFIX;
    const inputsCount = this.inputs.length;

    bufferWriter.writeVarintNum(prefix.length);
    bufferWriter.write(Buffer.from(prefix, 'utf-8'));
    bufferWriter.writeVarintNum(inputsCount);
    for (let i = 0; i < inputsCount; i += 1) {
      bufferWriter.writeReverse(
        Buffer.from(this.inputs[i].outpointHash, 'hex')
      );
      bufferWriter.writeUInt32LE(this.inputs[i].outpointIndex);
    }
    // Double-sha is used to protect from extension attacks.
    return doubleSha256(bufferWriter.toBuffer()).reverse();
  }

  /**
   * Selects the correct quorum that signed this InstantLock
   * msgHash
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry|null} - signatoryQuorum
   */
  selectSignatoryQuorum(smlStore, requestId, offset) {
    const instantlockSML = smlStore.getSMLbyHeight(
      smlStore.getTipHeight() - offset + 1
    );

    const llmq = instantlockSML.getInstantSendLLMQType();

    return instantlockSML.isLLMQTypeRotated(llmq) ?
      this.selectSignatoryRotatedQuorum(smlStore, requestId, offset) :
      this.selectSignatoryNonRotatedQuorum(smlStore, requestId, offset);
  }

  /**
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry|null} - signatoryQuorum
   */
  selectSignatoryNonRotatedQuorum(smlStore, requestId, offset) {
    const instantlockSML = smlStore.getSMLbyHeight(
      smlStore.getTipHeight() - offset + 1
    );

    const scoredQuorums = instantlockSML.calculateSignatoryQuorumScores(
      instantlockSML.getInstantSendLLMQType(),
      requestId
    );

    if (scoredQuorums.length === 0) {
      return null;
    }

    scoredQuorums.sort((a, b) => Buffer.compare(a.score, b.score));

    return scoredQuorums[0].quorum;
  }

  /**
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry|null} - signatoryQuorum
   */
  selectSignatoryRotatedQuorum(smlStore, requestId, offset) {
    const instantlockSML = smlStore.getSMLbyHeight(
      smlStore.getTipHeight() - offset + 1
    );

    // Take the last n bits of the requestId with n = log2(quorum count)
    // The value of these n bits will be the quorum index i.
    const quorums = instantlockSML.getQuorumsOfType(instantlockSML.getInstantSendLLMQType());
    const quorumCount = quorums.length;

    const n = Math.log2(quorumCount);

    const i = BufferUtil.readLastNBits(requestId, n);

    // // The LLMQ at index i should be used to perform signing.
    return quorums[i];
  }

  /**
   * Computes signature id for a quorum entry
   * @param {QuorumEntry} quorumEntry
   * @param {Buffer} requestId
   * @returns {Buffer} - Signature id for this requestId and quorum.
   */
  getSignHashForQuorumEntry(quorumEntry, requestId) {
    const { llmqType, quorumHash } = quorumEntry;

    const bufferWriter = new BufferWriter();
    bufferWriter.writeUInt8(llmqType);
    bufferWriter.writeReverse(Buffer.from(quorumHash, 'hex'));
    bufferWriter.writeReverse(requestId);
    bufferWriter.writeReverse(Buffer.from(this.txid, 'hex'));
    return doubleSha256(bufferWriter.toBuffer());
  }

  /**
   * Serializes InstantLock to JSON
   * @returns {Object} A plain object with the instantlock information
   */
  toObject() {
    this.validate();

    const result = {
      inputs: this.inputs,
      txid: this.txid,
      signature: this.signature.toString('hex'),
    };

    if (this.version >= 1) {
      result.version = this.version;
      result.cyclehash = this.cyclehash;
    }

    return result;
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
    this.validate();
    return this.toBufferWriter().toBuffer();
  }

  /**
   * @private
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the InstantLock
   */
  _toBufferWriterV17(bw) {
    const bufferWriter = bw || new BufferWriter();
    const inputsCount = this.inputs.length;
    bufferWriter.writeVarintNum(inputsCount);
    for (let i = 0; i < inputsCount; i += 1) {
      bufferWriter.writeReverse(
        Buffer.from(this.inputs[i].outpointHash, 'hex')
      );
      bufferWriter.writeInt32LE(this.inputs[i].outpointIndex);
    }
    bufferWriter.writeReverse(Buffer.from(this.txid, 'hex'));
    bufferWriter.write(Buffer.from(this.signature, 'hex'));

    return bufferWriter;
  }

  /**
   * @private
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the InstantLock
   */
  _toBufferWriterV18(bw) {
    const bufferWriter = bw || new BufferWriter();
    bufferWriter.writeUInt8(this.version);
    const inputsCount = this.inputs.length;
    bufferWriter.writeVarintNum(inputsCount);
    for (let i = 0; i < inputsCount; i += 1) {
      bufferWriter.writeReverse(
        Buffer.from(this.inputs[i].outpointHash, 'hex')
      );
      bufferWriter.writeInt32LE(this.inputs[i].outpointIndex);
    }
    bufferWriter.writeReverse(Buffer.from(this.txid, 'hex'));
    bufferWriter.writeReverse(Buffer.from(this.cyclehash, 'hex'));
    bufferWriter.write(Buffer.from(this.signature, 'hex'));

    return bufferWriter;
  }

  /**
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the InstantLock
   */
  toBufferWriter(bw) {
    if (this.version >= 1) {
      return this._toBufferWriterV18(bw);
    }

    return this._toBufferWriterV17(bw);
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
    return `<InstantLock: ${this.txid}, sig: ${this.signature}>`;
  }
}

module.exports = InstantLock;
