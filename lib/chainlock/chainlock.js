var isObject = require('lodash').isObject;
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
    if (arg) {
      if (arg instanceof ChainLock) {
        return arg.copy();
      } else if (BufferUtil.isBuffer(arg)) {
        return ChainLock.fromBuffer(arg);
      } else if (isObject(arg)) {
        return ChainLock.fromObject(arg);
      } else if (arg instanceof ChainLock) {
        return arg.copy();
      } else if (isHexString(arg)) {
        return ChainLock.fromHex(arg);
      } else {
        throw new TypeError('Unrecognized argument for ChainLock');
      }
    }
};



/**
 * @param {string} string
 * @return {ChainLock}
 */
ChainLock.fromHex = function fromString(string) {
  return ChainLock.fromBuffer(Buffer.from(string, 'hex'));
};


/**
 * Parse buffer and returns ChainLock
 * @param {Buffer} buffer
 * @return {ChainLock}
 */
ChainLock.fromBuffer = function fromBuffer(buffer) {
  var bufferReader = new BufferReader(buffer);
  var chainLock = new ChainLock();
  chainLock.height = bufferReader.readInt32LE()
  chainLock.blockHash = bufferReader.read(SHA256_HASH_SIZE).reverse().toString('hex');
  chainLock.signature = bufferReader.read(BLS_SIGNATURE_SIZE).toString('hex');
  return chainLock;
};

/**
 * Create ChainLock from an object
 * @param {Object} obj
 * @return {ChainLock}
 */
ChainLock.fromObject = function fromObject(obj) {
  var chainLock = new ChainLock();
  var blockHash = obj.blockHash || obj.blockhash;
  chainLock.blockHash = Buffer.from(blockHash, 'hex').reverse().toString('hex');
  chainLock.height = obj.height;
  chainLock.signature = obj.signature || obj.sig;
  chainLock.validate();
  return chainLock;
};

/**
 * Verify the signature
 * @returns {boolean}
 */
ChainLock.validSignature = function validSignature(signature) {
  return true
};

ChainLock.isValid = function isValid(blockHash, height, signature){
  return ChainLock.validSignature(signature);
}

ChainLock.verify = function (signature){
  return ChainLock.validSignature(signature)
}

ChainLock.prototype.validate = function validate() {
  $.checkArgument(utils.isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
  $.checkArgument(isHexStringOfSize(this.blockHash, SHA256_HASH_SIZE * 2), `Expected blockhash to be a hex string of size ${SHA256_HASH_SIZE}`);
  $.checkArgument(isHexStringOfSize(this.signature, BLS_SIGNATURE_SIZE * 2), 'Expected signature to be a bls signature');
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
  this.validate();
  return {
    height: this.height,
    blockHash: Buffer.from(this.blockHash, 'hex').reverse().toString('hex'),
    signature: this.signature
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
  this.validate();
  var bufferWriter = new BufferWriter();

  bufferWriter.writeInt32LE(this.height);
  bufferWriter.write(Buffer.from(this.blockHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.signature, 'hex'));

  return bufferWriter.toBuffer();
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
  return '<ChainLock: ' + this.blockHash.toString() + ', height: ' + this.height + '>';
};

module.exports = ChainLock;
