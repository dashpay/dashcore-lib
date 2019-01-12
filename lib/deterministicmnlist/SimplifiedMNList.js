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
  this.merkleRootMNList = '';
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

  this.sort();

  if (this.calculateMerkleRoot() !==  diff.merkleRootMNList) {
    // TODO: do something for the case of partial update, when final root can't be calculated yet
    throw new Error("Merkle root in the diff doesn't match calculated merkle root");
  }
};

/**
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
SimplifiedMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function(proRegTxHash) {
    var mnIndex = this.mnList.findIndex(function(MN) { return MN.proRegTxHash === proRegTxHash });
    delete this.mnList[mnIndex];
  });
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
    return Buffer.compare(Buffer.from(a.proRegTxHash, 'hex'), Buffer.from(b.proRegTxHash, 'hex'));
  });
};

SimplifiedMNList.prototype.calculateMerkleRoot = function calculateMerkleRoot() {
  return getMerkleRoot(getMerkleTree(this.mnList.map(
    function (mnListEntry) { return Buffer.from(mnListEntry.proRegTxHash, 'hex'); }
    ))).toString('hex');
};

module.exports = SimplifiedMNList;
