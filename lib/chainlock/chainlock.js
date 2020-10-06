var _ = require('lodash');
var isObject = _.isObject;
var isString = _.isString;
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var utils = require('../util/js');
var $ = require('../util/preconditions');
var constants = require('../constants');
var doubleSha256 = require('../crypto/hash').sha256sha256;

var isHexString = utils.isHexaString;
var isHexStringOfSize = utils.isHexStringOfSize;

var SHA256_HASH_SIZE = constants.SHA256_HASH_SIZE;
var BLS_SIGNATURE_SIZE = constants.BLS_SIGNATURE_SIZE;
var bls = require('../crypto/bls');

/**
 * Instantiate a ChainLock from a Buffer, hex string, JSON object / Object with the properties
 * of the ChainLock.
 *
 * @class ChainLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object representing a ChainLock
 * @property {number} height -
 * @property {Buffer} blockHash -
 * @property {Buffer} signature - merkle root of the quorum list
 */
function ChainLock(arg) {
  if (arg instanceof ChainLock) {
    return arg.copy();
  }
  var info = ChainLock._from(arg);

  this.height = info.height;
  this.blockHash = info.blockHash;
  this.signature = info.signature;

  return this;
};

/**
 * @param {Buffer|Object|string} arg - A Buffer, JSON string or Object
 * @returns {Object} - An object representing chainlock data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
ChainLock._from = function _from(arg) {
  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = ChainLock._fromBufferReader(BufferReader(arg));
  } else if (isObject(arg)) {
    info = ChainLock._fromObject(arg);
  } else if (isHexString(arg)) {
    info = ChainLock.fromHex(arg);
  } else {
    throw new TypeError('Unrecognized argument for ChainLock');
  }
  return info;
}

ChainLock._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  var blockHash = data.blockHash || data.blockhash;
  var signature = data.signature;
  if (isString(blockHash)) {
    blockHash = BufferUtil.reverse(Buffer.from(blockHash, 'hex'));
  }

  if (isString(data.signature)) {
    signature = Buffer.from(data.signature, 'hex');
  }
  var info = {
    height: data.height,
    blockHash: blockHash,
    signature: signature
  }
  return info;
}

/**
 * @param {BufferReader} br - Chainlock data
 * @returns {Object} - An object representing the chainlock data
 * @private
 */
ChainLock._fromBufferReader = function _fromBufferReader(br) {
  var info = {};
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
  var data = ChainLock._fromBufferReader(br);
  return new ChainLock(data);
};

/**
 * Creates ChainLock from a hex string.
 * @param {String} string - A hex string representation of the chainLock
 * @return {ChainLock} - An instance of ChainLock
 */
ChainLock.fromHex = ChainLock.fromString = function fromString(string) {
  return ChainLock.fromBuffer(Buffer.from(string, 'hex'));
};


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
  var data = ChainLock._fromObject(obj);
  return new ChainLock(data);
};

/**
 * Verify that the signature is valid against the Quorum using quorumPublicKey
 * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
 * @returns {Promise<Boolean>} - if the signature is valid for this quorum
 */
ChainLock.prototype.verifySignatureAgainstQuorum = async function verifySignatureAgainstQuorum(quorumEntry) {
  var self = this;
  return new Promise(function(resolve) {
    var quorumPublicKey = quorumEntry.quorumPublicKey;
    var signature = self.signature;
    var signatureId = self.getSignatureIDForQuorumEntry(quorumEntry);

    var blsInstance = bls.getInstance();
    return blsInstance.then((instance) => {
      var quorumPubKey = instance.PublicKey.fromBytes(Buffer.from(quorumPublicKey, 'hex'));
      var aggregationInfo = instance.AggregationInfo.fromMsgHash(quorumPubKey, signatureId);
      var thresholdSignature = instance.Signature.fromBytes(Buffer.from(signature,'hex'));

      thresholdSignature.setAggregationInfo(aggregationInfo);

      var isValid = thresholdSignature.verify();

      return resolve(isValid);
    })
  });
}

/**
 * Validate Chainlock structure
 */
ChainLock.prototype.validate = function validate() {
  $.checkArgument(utils.isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
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
  var bufferWriter = new BufferWriter();

  var prefix = ChainLock.CLSIG_REQUESTID_PREFIX;
  var prefixLength = prefix.length;

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
ChainLock.prototype.getSignatureIDForQuorumEntry = function (quorumEntry) {
  var llmqType = quorumEntry.llmqType;
  var quorumHash = quorumEntry.quorumHash;
  var requestID = this.getRequestId();
  var blockHash = this.blockHash;

  var bufferWriter = new BufferWriter();
  bufferWriter.writeUInt8(llmqType);
  bufferWriter.write(Buffer.from(quorumHash, 'hex'));
  bufferWriter.write(Buffer.from(requestID, 'hex'));
  bufferWriter.write(blockHash);
  return doubleSha256(bufferWriter.toBuffer());
}

/**
 * Serializes chainlock to JSON
 * @returns {Object} A plain object with the chainlock information
 */
ChainLock.prototype.toJSON = ChainLock.prototype.toObject = function toJSON() {
  return {
    height: this.height,
    blockHash: BufferUtil.reverse(this.blockHash).toString('hex'),
    signature: this.signature.toString('hex')
  };
};


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
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.writeInt32LE(this.height);
  bw.write(this.blockHash);
  bw.write(this.signature);
  return bw;
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
ChainLock.prototype.inspect = function () {
  return '<ChainLock: ' + BufferUtil.reverse(this.blockHash).toString('hex') + ', height: ' + this.height + '>';
};


ChainLock.CLSIG_REQUESTID_PREFIX = 'clsig';

module.exports = ChainLock;
