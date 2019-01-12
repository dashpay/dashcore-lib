/* eslint-disable */

var SimplifiedMNListDiff = require('./SimplifiedMNListDiff');

function DeterministicMNList() {
  this.mnList = [];
  this.merkleRootMNList = '';
}

/**
 *
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
 */
DeterministicMNList.prototype.applyDiff = function applyDiff(simplifiedMNListDiff) {
  // This will copy instance of SimplifiedMNListDiff or create a new instance if serialized data is passed
  var diff = new SimplifiedMNListDiff(simplifiedMNListDiff);
  this.deleteMNs(diff.deletedMNs);
  this.addMNs();
};

/**
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
DeterministicMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function(proRegTxHash) {
    var mnIndex = this.mnList.findIndex(function(MN) { return MN.proRegTxHash === proRegTxHash });
    delete this.mnList[mnIndex];
  });
};

DeterministicMNList.prototype.addMNs = function addMNs() {};
/**
 * @private sorts MN List in deterministic order
 */
DeterministicMNList.prototype.sort = function sort() {};
DeterministicMNList.prototype.verify = function verify() {};
DeterministicMNList.prototype.toJSON = function toJSON() {};

module.exports = DeterministicMNList;
