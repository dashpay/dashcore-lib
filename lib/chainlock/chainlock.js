var _ = require('lodash');
var isObject = _.isObject;
var isString = _.isString;
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var utils = require('../util/js');
var $ = require('../util/preconditions');
var Hash = require('../crypto/hash');
var constants = require('../constants');
const {sha256} = require("../crypto/hash");
var doubleSha256 = require('../crypto/hash').sha256sha256;

var isHexString = utils.isHexaString;
var isHexStringOfSize = utils.isHexStringOfSize;

var SHA256_HASH_SIZE = constants.SHA256_HASH_SIZE;
var BLS_PUBLIC_KEY_SIZE = constants.BLS_PUBLIC_KEY_SIZE;
var BLS_SIGNATURE_SIZE = constants.BLS_SIGNATURE_SIZE;
var CLSIG_REQUESTID_PREFIX = constants.CLSIG_REQUESTID_PREFIX;

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

ChainLock._from = function _from(arg){
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

/**
 * @param {string} string
 * @return {ChainLock}
 */
ChainLock.fromHex = function fromString(string) {
  return ChainLock.fromBuffer(Buffer.from(string, 'hex'));
};


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
 * Parse buffer and returns ChainLock
 * @param {Buffer} buffer - A buffer of the chainLock
 * @return {ChainLock} - An instance of ChainLock
 */
ChainLock.fromBuffer = function fromBuffer(buffer) {
  return ChainLock.fromBufferReader(new BufferReader(buffer));
};

ChainLock._fromObject = function _fromObject(data){
  $.checkArgument(data, 'data is required');

  var blockHash = data.blockHash;
  var signature = data.signature;
  if (isString(data.blockHash)) {
    blockHash = BufferUtil.reverse(Buffer.from(data.blockHash, 'hex'));
  }

  if (isString(data.signature)) {
    signature = Buffer.from(data.signature, 'hex');
  }
  var info = {
    height: data.height,
    blockHash: blockHash,
    signature: signature
  }
  //
  // var chainLock = new ChainLock();
  // var blockHash = obj.blockHash || obj.blockhash;
  // chainLock.blockHash = Buffer.from(blockHash, 'hex').reverse().toString('hex');
  // chainLock.height = obj.height;
  // chainLock.signature = obj.signature || obj.sig;
  // chainLock.validate();
  return info;
}
/**
 * Create ChainLock from an object
 * @param {Object} obj
 * @return {ChainLock}
 */
ChainLock.fromObject = function fromObject(obj) {
  var data = ChainLock._fromObject(obj);
  return new ChainLock(data);
};


ChainLock.verifySignatureAgainstQuorum = function verifySignatureAgainstQuorum(quorum){
  // const publicKey = quorum.quorumPublicKey;
  return true;
}
/**
 * Verify the signature
 * @returns {boolean}
 */
ChainLock.isValidSignature = function isValidSignature(blockHash, height, signature, quorumHash, llmqType, quorum) {
  // sha256(llmqType, quorumHash, sha256(height), blockHash)
  return ChainLock.verifySignatureAgainstQuorum(quorum);
};

ChainLock.isValid = function isValid(blockHash, height, signature, quorumHash, llmqType){
  return ChainLock.isValidSignature(blockHash, height, signature, quorumHash, llmqType);
}

ChainLock.verify = function (blockHash, height, signature, quorumHash, llmqType){
  return ChainLock.isValidSignature(blockHash, height, signature, quorumHash, llmqType)
}

ChainLock.prototype.validate = function validate() {
  $.checkArgument(utils.isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
  $.checkArgument(isHexStringOfSize(this.blockHash.toString('hex'), SHA256_HASH_SIZE * 2), `Expected blockhash to be a hex string of size ${SHA256_HASH_SIZE}`);
  $.checkArgument(isHexStringOfSize(this.signature.toString('hex'), BLS_SIGNATURE_SIZE * 2), 'Expected signature to be a bls signature');
};

ChainLock.prototype.getHash = function getHash() {
  return doubleSha256(this.toBuffer()).reverse();
};
ChainLock.prototype.getRequestId = function getRequestId() {
  var bufferWriter = new BufferWriter();
  bufferWriter.write(Buffer.from(CLSIG_REQUESTID_PREFIX,'utf-8'));
  bufferWriter.writeUInt32LE(this.height);
  return doubleSha256(bufferWriter.toBuffer());
};

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
  return this.toBufferWriter().concat();
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
 * @return {ChainLock}
 */
ChainLock.prototype.copy = function copy() {
  return ChainLock.fromBuffer(this.toBuffer());
};

/**
 * Will return a string formatted for the console
 *
 * @returns {string} ChainLock block hash and height
 */
ChainLock.prototype.inspect = function() {
  return '<ChainLock: ' + BufferUtil.reverse(this.blockHash).toString('hex') + ', height: ' + this.height + '>';
};

module.exports = ChainLock;
