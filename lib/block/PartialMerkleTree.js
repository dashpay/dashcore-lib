const isObject = require('lodash/isObject');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const isHexString = require('../util/js').isHexa;
const constants = require('../constants');
const MerkleTreeUtils = require('../util/merkletree');
const BitArrayUtils = require('../util/bitarray');

const { convertBitArrayToUInt8Array } = BitArrayUtils;

/**
 * @param {Buffer|string|PartialMerkleTree|{transactionHashes: Buffer[],filterMatches: boolean[]}} [serialized]
 * @return {PartialMerkleTree}
 * @class
 * @property {number} totalTransactions
 * @property {string[]} merkleHashes
 * @property {number[]} merkleFlags
 */
function PartialMerkleTree(serialized) {
  if (serialized) {
    if (serialized instanceof PartialMerkleTree) {
      return serialized.copy();
    } if (BufferUtil.isBuffer(serialized)) {
      return PartialMerkleTree.fromBuffer(serialized);
    } if (isHexString(serialized)) {
      return PartialMerkleTree.fromHexString(serialized);
    } if (isObject(serialized)) {
      const treeHeight = MerkleTreeUtils.calculateTreeHeight(serialized.transactionHashes.length);
      const tree = MerkleTreeUtils.traverseAndBuildPartialTree(
        treeHeight, 0, serialized.transactionHashes, serialized.filterMatches,
      );

      this.totalTransactions = serialized.transactionHashes.length;
      this.merkleFlags = convertBitArrayToUInt8Array(tree.flags, true);
      this.merkleHashes = tree.merkleHashes;
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
  const partialMerkleTree = new PartialMerkleTree();
  partialMerkleTree.totalTransactions = bufferReader.readUInt32LE();

  const merkleHashesCount = bufferReader.readVarintNum();
  partialMerkleTree.merkleHashes = [];
  for (let i = 0; i < merkleHashesCount; i += 1) {
    partialMerkleTree.merkleHashes.push(bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex'));
  }

  const merkleFlagsCount = bufferReader.readVarintNum();
  partialMerkleTree.merkleFlags = [];
  for (let i = 0; i < merkleFlagsCount; i += 1) {
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
  const bufferWriter = new BufferWriter();

  bufferWriter.writeUInt32LE(this.totalTransactions);

  bufferWriter.writeVarintNum(this.merkleHashes.length);
  this.merkleHashes.forEach((hash) => {
    bufferWriter.write(Buffer.from(hash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.merkleFlags.length);
  this.merkleFlags.forEach((flag) => {
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
