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
 * Instantiate a ChainLock from a Buffer, hex string, JSON object / Object with the properties
 * of the ChainLock.
 *
 * @class ChainLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object
 * representing a ChainLock
 * @property {number} height -
 * @property {Buffer} blockHash -
 * @property {Buffer} signature - merkle root of the quorum list
 */
function ChainLock(arg) {
  if (arg instanceof ChainLock) {
    return arg.copy();
  }
  const info = ChainLock._from(arg);

  this.height = info.height;
  this.blockHash = info.blockHash;
  this.signature = info.signature;

  return this;
}

/**
 * @param {Buffer|Object|string} arg - A Buffer, JSON string or Object
 * @returns {Object} - An object representing chainlock data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
ChainLock._from = function _from(arg) {
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
};

ChainLock._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  let blockHash = data.blockHash || data.blockhash;
  let { signature } = data;
  if (isString(blockHash)) {
    blockHash = BufferUtil.reverse(Buffer.from(blockHash, 'hex'));
  }

  if (isString(data.signature)) {
    signature = Buffer.from(data.signature, 'hex');
  }
  const info = {
    height: data.height,
    blockHash,
    signature,
  };
  return info;
};

/**
 * @param {BufferReader} br - Chainlock data
 * @returns {Object} - An object representing the chainlock data
 * @private
 */
ChainLock._fromBufferReader = function _fromBufferReader(br) {
  const info = {};
  info.height = br.readInt32LE();
  info.blockHash = br.read(SHA256_HASH_SIZE);
  info.signature = br.read(BLS_SIGNATURE_SIZE);
  return info;
};

/**
 * @param {BufferReader} br A buffer reader of the block
 * @returns {ChainLock} - An instance of ChainLock
 */
ChainLock.fromBufferReader = function fromBufferReader(br) {
  $.checkArgument(br, 'br is required');
  const data = ChainLock._fromBufferReader(br);
  return new ChainLock(data);
};

/**
 * Creates ChainLock from a hex string.
 * @param {String} string - A hex string representation of the chainLock
 * @return {ChainLock} - An instance of ChainLock
 */
ChainLock.fromString = function fromString(string) {
  return ChainLock.fromBuffer(Buffer.from(string, 'hex'));
};

ChainLock.fromHex = ChainLock.fromString;

/**
 * Creates ChainLock from a Buffer.
 * @param {Buffer} buffer - A buffer of the chainLock
 * @return {ChainLock} - An instance of ChainLock
 */
ChainLock.fromBuffer = function fromBuffer(buffer) {
  return ChainLock.fromBufferReader(new BufferReader(buffer));
};

/**
 * Create ChainLock from an object
 * @param {Object} obj - an object with all properties of chainlock
 * @return {ChainLock}
 */
ChainLock.fromObject = function fromObject(obj) {
  const data = ChainLock._fromObject(obj);
  return new ChainLock(data);
};
/**
 * Verify that the signature is valid against the Quorum using quorumPublicKey
 * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
 * @returns {Promise<Boolean>} - if the signature is valid for this quorum
 */
async function verifySignatureAgainstQuorum(quorumEntry) {
  const { signature } = this;
  const { quorumPublicKey } = quorumEntry;
  const signatureId = this.getSignatureIDForQuorumEntry(quorumEntry);

  const blsInstance = await bls.getInstance();

  const quorumPubKey = blsInstance.PublicKey.fromBytes(Buffer.from(quorumPublicKey, 'hex'));

  const aggregationInfo = blsInstance.AggregationInfo.fromMsgHash(quorumPubKey, signatureId);
  const thresholdSignature = blsInstance.Signature.fromBytes(Buffer.from(signature, 'hex'));

  thresholdSignature.setAggregationInfo(aggregationInfo);

  return thresholdSignature.verify();
}
ChainLock.prototype.verifySignatureAgainstQuorum = verifySignatureAgainstQuorum;
/**
 * Validate Chainlock structure
 */
ChainLock.prototype.validate = function validate() {
  $.checkArgument(isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
  $.checkArgument(isHexStringOfSize(this.blockHash.toString('hex'), SHA256_HASH_SIZE * 2), `Expected blockhash to be a hex string of size ${SHA256_HASH_SIZE}`);
  $.checkArgument(isHexStringOfSize(this.signature.toString('hex'), BLS_SIGNATURE_SIZE * 2), 'Expected signature to be a bls signature');
};

/**
 * Returns chainLock hash
 * @returns {Buffer}
 */
ChainLock.prototype.getHash = function getHash() {
  return doubleSha256(this.toBuffer()).reverse();
};

/**
 * Computes the request ID for this ChainLock
 * @returns {Buffer} - Request id for this chainlock
 */
ChainLock.prototype.getRequestId = function getRequestId() {
  const bufferWriter = new BufferWriter();

  const prefix = ChainLock.CLSIG_REQUESTID_PREFIX;
  const prefixLength = prefix.length;

  bufferWriter.writeVarintNum(prefixLength);
  bufferWriter.write(Buffer.from(ChainLock.CLSIG_REQUESTID_PREFIX, 'utf-8'));
  bufferWriter.writeUInt32LE(this.height);

  // Double-sha is used to protect from extension attacks.
  return doubleSha256(bufferWriter.toBuffer());
};

/**
 * Computes signature id for a quorum entry
 * @param {QuorumEntry} quorumEntry
 * @returns {Buffer} - Signature id for this requestId and quorum.
 */
ChainLock.prototype.getSignatureIDForQuorumEntry = function getSignatureIDForQuorumEntry(quorumEntry) {
  const { llmqType, quorumHash } = quorumEntry;
  const requestID = this.getRequestId();
  const { blockHash } = this;

  const bufferWriter = new BufferWriter();
  bufferWriter.writeUInt8(llmqType);
  bufferWriter.write(Buffer.from(quorumHash, 'hex'));
  bufferWriter.write(Buffer.from(requestID, 'hex'));
  bufferWriter.write(blockHash);
  return doubleSha256(bufferWriter.toBuffer());
};

/**
 * Serializes chainlock to JSON
 * @returns {Object} A plain object with the chainlock information
 */
ChainLock.prototype.toObject = function toJSON() {
  return {
    height: this.height,
    blockHash: BufferUtil.reverse(this.blockHash).toString('hex'),
    signature: this.signature.toString('hex'),
  };
};

/**
 * Serializes chainlock to Object
 * @returns {Object} A plain object with the chainlock information
 */
ChainLock.prototype.toJSON = ChainLock.prototype.toObject;

/**
 * Serialize ChainLock
 * @returns {string} - A hex encoded string of the chainlock
 */
ChainLock.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * Serialize ChainLock to buffer
 * @return {Buffer}
 */
ChainLock.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().toBuffer();
};

/**
 * @param {BufferWriter} bw - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the ChainLock
 */
ChainLock.prototype.toBufferWriter = function toBufferWriter(bw) {
  const bufferWriter = bw || new BufferWriter();
  bufferWriter.writeInt32LE(this.height);
  bufferWriter.write(this.blockHash);
  bufferWriter.write(this.signature);
  return bufferWriter;
};
/**
 * Creates a copy of ChainLock
 * @return {ChainLock} - a new copy instance of ChainLock
 */
ChainLock.prototype.copy = function copy() {
  return ChainLock.fromBuffer(this.toBuffer());
};

/**
 * Will return a string formatted for the console
 *
 * @returns {string} ChainLock block hash and height
 */
ChainLock.prototype.inspect = function inspect() {
  const reversedBlockHash = BufferUtil.reverse(this.blockHash).toString('hex');
  return `<ChainLock: ${reversedBlockHash}, height: ${this.height}>`;
};


ChainLock.CLSIG_REQUESTID_PREFIX = 'clsig';

module.exports = ChainLock;
