/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var isObject = require('lodash/isObject');
var isHexString = require('../util/js').isHexa;
var constants = require('../constants');
var MerkleTreeUtils = require('../util/merkletree');
var calculateTreeWidth = MerkleTreeUtils.calculateTreeWidth;
var calculateHashAtHeight = MerkleTreeUtils.calculateHashAtHeight;

/**
 * @param serialized
 * @return {PartialMerkleTree}
 * @class
 * @property {number} totalTransactions
 * @property {string[]} merkleHashes
 * @property {number[]} merkleFlags
 * @property {number[]} internalFlags - Internal representation of merkle flags
 * @private
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
  this.totalTransactions = 0;
  this.merkleHashes = [];
  this.internalFlags = [];
  this.merkleFlags = [];
}

/* Static methods */

/**
 * Builds partial merkle tree from transaction hashes and filter matches for those transactions.
 * @param {Buffer[]} transactionHashes - all transaction hashes from the block
 * @param {boolean[]} filterMatches - corresponding array of filter matches
 * @return {PartialMerkleTree}
 */
PartialMerkleTree.build = function build(transactionHashes, filterMatches) {
  var partialTree = new PartialMerkleTree();
  partialTree.totalTransactions = transactionHashes.length;

  var treeHeight = 0;
  while (calculateTreeWidth(partialTree.totalTransactions, treeHeight) > 1) {
    treeHeight++;
  }

  partialTree.traverseAndBuild(treeHeight, 0, transactionHashes, filterMatches);
  this.merkleFlags = PartialMerkleTree.convertBitArrayToUInt8Array(this.internalFlags);
  return partialTree;
};

PartialMerkleTree.convertBitArrayToUInt8Array = function bitArrayToByteArray(bitArray) {
  return PartialMerkleTree.convertBitStringToUInt8Array(bitArray.join(''));
};

/**
 * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
 * @param {string} bitString
 * @return {number[]}
 */
PartialMerkleTree.convertBitStringToUInt8Array = function bitStringToArray(bitString) {
  var bytes = bitString.match(/.{1,8}/g);
  return bytes.map(function (byte) {
    return parseInt(byte, 2);
  });
};

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
 * Builds partial merkle tree
 * @private
 * @param {number} height
 * @param {number} pos
 * @param {Buffer[]} txIds
 * @param {boolean[]} matches
 */
PartialMerkleTree.prototype.traverseAndBuild = function traverseAndBuild(height, pos, txIds, matches) {
  // determine whether this node is the parent of at least one matched txid
  var parentOfMatch = false;
  for (var p = pos << height; p < (pos + 1) << height && p < this.totalTransactions; p++) {
    parentOfMatch |= matches[p];
  }
  // store as flag bit
  this.internalFlags.push(parentOfMatch);
  if (height === 0 || !parentOfMatch) {
    // if at height 0, or nothing interesting below, store hash and stop
    this.merkleHashes.push(calculateHashAtHeight(this.totalTransactions, height, pos, txIds).toString('hex'));
  } else {
    // otherwise, don't store any hash, but descend into the subtrees
    this.traverseAndBuild(height - 1, pos * 2, txIds, matches);
    if (pos * 2 + 1 < calculateTreeWidth(this.totalTransactions,height - 1)) {
      this.traverseAndBuild(height - 1, pos * 2 + 1, txIds, matches);
    }
  }
};

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
