/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var isObject = require('lodash/isObject');
var isHexString = require('../util/js').isHexa;
var constants = require('../constants');

/**
 * @param serialized
 * @return {PartialMerkleTree}
 * @class
 * @property {number} totalTransactions
 * @property {Array<string>} merkleHashes
 * @property {Array<number>} merkleFlags
 */
function PartialMerkleTree(serialized) {
  if (serialized) {
    if (serialized instanceof PartialMerkleTree) {
      return serialized.copy();
    } else if (BufferUtil.isBuffer(serialized)) {
      return PartialMerkleTree.fromBuffer(serialized);
    } else if (isObject(serialized)) {
      return PartialMerkleTree.fromObject(serialized);
    } else if (isHexString(serialized)) {
      return PartialMerkleTree.fromHexString(serialized);
    } else {
      throw new Error('Invalid argument passed to PartialMerkleTree - expected hex string, object or buffer');
    }
  }
}

/* Static methods */

/**
 * Creates an instance of PartialMerkleTree from buffer reader
 * @param {BufferReader} bufferReader
 * @return {PartialMerkleTree}
 */
PartialMerkleTree.fromBufferReader = function fromBufferReader(bufferReader) {
  var partialMerkleTree = new PartialMerkleTree();
  partialMerkleTree.totalTransactions = bufferReader.readUInt32LE();

  var merkleHashesCount = bufferReader.readVarintNum();
  partialMerkleTree.merkleHashes = [];
  for (var i = 0; i < merkleHashesCount; i++) {
    partialMerkleTree.merkleHashes.push(bufferReader.read(constants.SHA256_HASH_SIZE).toString('hex'));
  }

  var merkleFlagsCount = bufferReader.readVarintNum();
  partialMerkleTree.merkleFlags = [];
  for (i = 0; i < merkleFlagsCount; i++) {
    partialMerkleTree.merkleFlags.push(bufferReader.readUInt8());
  }

  return partialMerkleTree;
};

/**
 * @param {Buffer} buffer
 * @return {PartialMerkleTree}
 */
PartialMerkleTree.fromBuffer = function fromBuffer(buffer) {
  return PartialMerkleTree.fromBufferReader(new BufferReader(buffer));
};

/**
 * @param {string} hexString
 * @return {PartialMerkleTree}
 */
PartialMerkleTree.fromHexString = function fromHexString(hexString) {
  return PartialMerkleTree.fromBuffer(Buffer.from(hexString, 'hex'));
};

/* Instance methods */

/**
 * @return {Buffer}
 */
PartialMerkleTree.prototype.toBuffer = function toBuffer() {
  var bufferWriter = new BufferWriter();

  bufferWriter.writeUInt32LE(this.totalTransactions);

  bufferWriter.writeVarintNum(this.merkleHashes.length);
  this.merkleHashes.forEach(function (hash) {
    bufferWriter.write(Buffer.from(hash, 'hex'));
  });

  bufferWriter.writeVarintNum(this.merkleFlags.length);
  this.merkleFlags.forEach(function(flag) {
    bufferWriter.writeUInt8(flag);
  });

  return bufferWriter.toBuffer();
};

/**
 * @return {PartialMerkleTree}
 */
PartialMerkleTree.prototype.copy = function copy() {
  return PartialMerkleTree.fromBuffer(this.toBuffer());
};

/**
 * @return {string}
 */
PartialMerkleTree.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

module.exports = PartialMerkleTree;
