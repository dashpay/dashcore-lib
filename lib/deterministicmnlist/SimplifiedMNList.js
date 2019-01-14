/* eslint-disable */

var merkleUtils = require('../util/merkletree');
var SimplifiedMNListDiff = require('./SimplifiedMNListDiff');

var getMerkleTree = merkleUtils.getMerkleTree;
var getMerkleRoot = merkleUtils.getMerkleRoot;

function SimplifiedMNList() {
  this.blockHash = 1;
  /**
   * @type {Array<SimplifiedMNListEntry>}
   */
  this.mnList = [];
  this.lastDiffMerkleRootMNList = '';
}

/**
 *
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
 */
SimplifiedMNList.prototype.applyDiff = function applyDiff(simplifiedMNListDiff) {
  // This will copy instance of SimplifiedMNListDiff or create a new instance if serialized data is passed
  var diff = new SimplifiedMNListDiff(simplifiedMNListDiff);

  this.blockHash = simplifiedMNListDiff.blockHash;

  this.deleteMNs(diff.deletedMNs);
  this.addMNs(diff.mnList);

  this.lastDiffMerkleRootMNList = diff.merkleRootMNList;
};

SimplifiedMNList.prototype.applyDiffAndVerify = function applyDiffAndVerify(simplifiedMNListDiff) {
  this.applyDiff(simplifiedMNListDiff);
  if (!this.verify()) {
    throw new Error("Merkle root from the diff doesn't match calculated merkle root");
  }
};

/**
 * Compares merkle root from the most recent diff applied matches the merkle root of the list
 * @returns {boolean}
 */
SimplifiedMNList.prototype.verify = function verify() {
  return this.calculateMerkleRoot() === this.lastDiffMerkleRootMNList;
};

/**
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
SimplifiedMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function(proRegTxHash) {
    var mnIndex = this.mnList.findIndex(function(MN) { return MN.proRegTxHash === proRegTxHash });
    delete this.mnList[mnIndex];
  }, this);
};

/**
 *
 * @param {SimplifiedMNListEntry[]} mnListEntries
 */
SimplifiedMNList.prototype.addMNs = function addMNs(mnListEntries) {
  var copiedMNListEntries = mnListEntries.map(function(mnListEntry) { return mnListEntry.copy(); });
  this.mnList = this.mnList.concat(copiedMNListEntries);
};

/**
 * @private sorts MN List in deterministic order
 */
SimplifiedMNList.prototype.sort = function sort() {
  this.mnList.sort(function(a, b) {
    return Buffer.compare(Buffer.from(a.proRegTxHash, 'hex').reverse(), Buffer.from(b.proRegTxHash, 'hex').reverse());
  });
};

/**
 * Calculates merkle root of the MN list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRoot = function calculateMerkleRoot() {
  this.sort();
  var sortedEntryHashes = this.mnList.map(
    function (mnListEntry) {
      return mnListEntry.calculateHash();
    }
  );
  return getMerkleRoot(getMerkleTree(sortedEntryHashes)).reverse().toString('hex');
};

module.exports = SimplifiedMNList;
