/* eslint-disable */
var doubleSha256 = require('../crypto/hash').sha256sha256;

/**
 * Builds a merkle tree of all passed hashes
 * @link https://en.bitcoin.it/wiki/Protocol_specification#Merkle_Trees
 * @param {Buffer[]} hashes
 * @returns {Buffer[]} - An array with each level of the tree after the other.
 */
function getMerkleTree(hashes) {
  // Copy all buffers in the tree to avoid unexpected behaviour
  var tree = hashes.map(Buffer.from);

  var j = 0;
  for (var size = hashes.length; size > 1; size = Math.floor((size + 1) / 2)) {
    for (var i = 0; i < size; i += 2) {
      var i2 = Math.min(i + 1, size - 1);
      var buf = Buffer.concat([tree[j + i], tree[j + i2]]);
      tree.push(Buffer.from(doubleSha256(buf), 'hex'));
    }
    j += size;
  }

  return tree;
}

/**
 * Copies root of the passed tree to a new Buffer and returns it
 * @param {Buffer[]} merkleTree
 * @returns {Buffer|undefined} - A buffer of the merkle root hash
 */
function getMerkleRoot(merkleTree) {
  if (merkleTree.length === 0) {
    return undefined;
  }
  // Copy root buffer
  return Buffer.from(merkleTree[merkleTree.length - 1]);
}

/**
 * Helper function to efficiently calculate the number of nodes at given height in the merkle tree
 * @param {number} totalElementsCount
 * @param {number} height
 * @return {number}
 */
function calculateTreeWidth(totalElementsCount, height) {
  return (totalElementsCount + (1 << height ) - 1) >> height;
}

/**
 *
 * @param {number} totalElementsCount
 * @param {number} height
 * @param {number} pos
 * @param {Buffer[]} hashes
 * @return {Buffer}
 */
function calculateHashAtHeight(totalElementsCount, height, pos, hashes) {
  if (height === 0) {
    return hashes[pos];
  } else {
    // calculate left hash
    var left = calculateHashAtHeight(totalElementsCount,height - 1, pos * 2, hashes);
    var right = left;
    // calculate right hash if not beyond the end of the array - copy left hash otherwise
    if (pos*2+1 < calculateTreeWidth(totalElementsCount, height - 1)) {
      right = calculateHashAtHeight(totalElementsCount,height - 1, pos * 2 + 1, hashes);
    }

    var concatenatedHashes = Buffer.concat(left, right);
    return Buffer.from(doubleSha256(concatenatedHashes), 'hex');
  }
}

module.exports = {
  getMerkleTree: getMerkleTree,
  getMerkleRoot: getMerkleRoot,
  calculateTreeWidth: calculateTreeWidth,
  calculateHashAtHeight: calculateHashAtHeight
};
