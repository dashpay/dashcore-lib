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
  return (totalElementsCount + (1 << height) - 1) >> height;
}

/**
 * @param {number} hashesCount
 * @return {number}
 */
function calculateTreeHeight(hashesCount) {
  var treeHeight = 0;
  while (calculateTreeWidth(hashesCount, treeHeight) > 1) {
    treeHeight++;
  }
  return treeHeight;
}

/**
 *
 * @param {number} height
 * @param {number} position
 * @param {Buffer[]} hashes
 * @return {Buffer}
 */
function calculateHashAtHeight(height, position, hashes) {
  if (height === 0) {
    return hashes[position];
  } else {
    // calculate left hash
    var left = calculateHashAtHeight(height - 1, position * 2, hashes);
    var right = left;
    // calculate right hash if not beyond the end of the array - copy left hash otherwise
    if (position * 2 + 1 < calculateTreeWidth(hashes.length, height - 1)) {
      right = calculateHashAtHeight(height - 1, position * 2 + 1, hashes);
    }

    var concatenatedHashes = Buffer.concat([
      Buffer.from(left).reverse(),
      Buffer.from(right).reverse(),
    ]);
    return Buffer.from(doubleSha256(concatenatedHashes), 'hex').reverse();
  }
}

/**
 * @param {number} height
 * @param {number} position
 * @param {Buffer[]} hashes
 * @param {boolean[]} matches
 * @return {{flags: boolean[], merkleHashes: string[]}}
 */
function traverseAndBuildPartialTree(height, position, hashes, matches) {
  var flags = [];
  var merkleHashes = [];
  // determine whether this node is the parent of at least one matched txid
  var parentOfMatch = false;
  for (
    var p = position << height;
    p < (position + 1) << height && p < hashes.length;
    p++
  ) {
    parentOfMatch |= matches[p];
  }
  // store as flag bit
  flags.push(Boolean(parentOfMatch));
  if (height === 0 || !Boolean(parentOfMatch)) {
    // if at height 0, or nothing interesting below, store hash and stop
    merkleHashes.push(
      calculateHashAtHeight(height, position, hashes).toString('hex')
    );
  } else {
    // otherwise, don't store any hash, but descend into the subtrees
    var tree = traverseAndBuildPartialTree(
      height - 1,
      position * 2,
      hashes,
      matches
    );
    flags = flags.concat(tree.flags);
    merkleHashes = merkleHashes.concat(tree.merkleHashes);
    if (position * 2 + 1 < calculateTreeWidth(hashes.length, height - 1)) {
      tree = traverseAndBuildPartialTree(
        height - 1,
        position * 2 + 1,
        hashes,
        matches
      );
      flags = flags.concat(tree.flags);
      merkleHashes = merkleHashes.concat(tree.merkleHashes);
    }
  }

  return { flags: flags, merkleHashes: merkleHashes };
}

module.exports = {
  getMerkleTree: getMerkleTree,
  getMerkleRoot: getMerkleRoot,
  calculateTreeWidth: calculateTreeWidth,
  calculateTreeHeight: calculateTreeHeight,
  calculateHashAtHeight: calculateHashAtHeight,
  traverseAndBuildPartialTree: traverseAndBuildPartialTree,
};
