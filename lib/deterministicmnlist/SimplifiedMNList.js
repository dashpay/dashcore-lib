/* eslint-disable */

var merkleUtils = require('../util/merkletree');
var SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
var constants = require('../constants');
var Transaction = require('../transaction');

var getMerkleTree = merkleUtils.getMerkleTree;
var getMerkleRoot = merkleUtils.getMerkleRoot;

function SimplifiedMNList(simplifiedMNListDiff) {
  this.baseBlockHash = constants.NULL_HASH;
  this.blockHash = constants.NULL_HASH;
  /**
   * Note that this property contains ALL masternodes, including banned ones.
   * Use getValidMasternodesList() method to get the list of only valid nodes.
   * This in needed for merkleRootNMList calculation
   * @type {SimplifiedMNListEntry[]}
   */
  this.mnList = [];
  /**
   * This property contains only valid, not PoSe-banned nodes.
   * @type {SimplifiedMNListEntry[]}
   */
  this.validMNs = [];
  this.merkleRootMNList = constants.NULL_HASH;
  this.lastDiffMerkleRootMNList = constants.NULL_HASH;
  this.cbTx = null;
  this.cbTxMerkleTree = null;
  if (simplifiedMNListDiff) {
    this.applyDiff(simplifiedMNListDiff);
  }
}

/**
 *
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
 */
SimplifiedMNList.prototype.applyDiff = function applyDiff(simplifiedMNListDiff) {
  // This will copy instance of SimplifiedMNListDiff or create a new instance if serialized data is passed
  var diff = new SimplifiedMNListDiff(simplifiedMNListDiff);

  if (this.baseBlockHash === constants.NULL_HASH) {
    /* If the base block hash is a null hash, then this is the first time we apply any diff.
    * If we apply diff to the list for the first time, than diff's base block hash would be the base block hash
    * for the whole list.
    * */
    this.baseBlockHash = diff.baseBlockHash;
  }

  this.blockHash = diff.blockHash;

  this.deleteMNs(diff.deletedMNs);
  this.addOrUpdateMNs(diff.mnList);

  this.lastDiffMerkleRootMNList = diff.merkleRootMNList || constants.NULL_HASH;
  this.merkleRootMNList = this.calculateMerkleRoot();

  if (!this.verify()) {
    throw new Error("Merkle root from the diff doesn't match calculated merkle root after diff is applied");
  }

  this.cbTx = new Transaction(diff.cbTx);
  this.cbTxMerkleTree = diff.cbTxMerkleTree.copy();

  this.validMNs = this.mnList.filter(function (smlEntry) {
    return smlEntry.isValid;
  });
};

/**
 * @private
 * Adds MNs to the MN list
 * @param {SimplifiedMNListEntry[]} mnListEntries
 */
SimplifiedMNList.prototype.addOrUpdateMNs = function addMNs(mnListEntries) {
  var newMNListEntries = mnListEntries.map(function (mnListEntry) {
    return mnListEntry.copy();
  });
  newMNListEntries.forEach(function (newMNListEntry) {
    var indexOfOldEntry = this.mnList.findIndex(function (oldMNListEntry) {
      return oldMNListEntry.proRegTxHash === newMNListEntry.proRegTxHash;
    });
    if (indexOfOldEntry > -1) {
      this.mnList[indexOfOldEntry] = newMNListEntry;
    } else {
      return this.mnList.push(newMNListEntry);
    }
  }, this);
};

/**
 * @private
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
SimplifiedMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function (proRegTxHash) {
    var mnIndex = this.mnList.findIndex(function (MN) {
      return MN.proRegTxHash === proRegTxHash;
    });
    if (mnIndex > -1) {
      this.mnList.splice(mnIndex, 1);
    }
  }, this);
};

/**
 * Compares merkle root from the most recent diff applied matches the merkle root of the list
 * @returns {boolean}
 */
SimplifiedMNList.prototype.verify = function verify() {
  return this.calculateMerkleRoot() === this.lastDiffMerkleRootMNList;
};

/**
 * @private
 * Sorts MN List in deterministic order
 */
SimplifiedMNList.prototype.sort = function sort() {
  this.mnList.sort(function (a, b) {
    return Buffer.compare(Buffer.from(a.proRegTxHash, 'hex').reverse(), Buffer.from(b.proRegTxHash, 'hex').reverse());
  });
};

/**
 * Calculates merkle root of the MN list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRoot = function calculateMerkleRoot() {
  if (this.mnList.length < 1) {
    return constants.NULL_HASH;
  }
  this.sort();
  var sortedEntryHashes = this.mnList.map(
    function (mnListEntry) {
      return mnListEntry.calculateHash();
    }
  );
  return getMerkleRoot(getMerkleTree(sortedEntryHashes)).reverse().toString('hex');
};

/**
 * Returns a list of valid masternodes
 * @returns {SimplifiedMNListEntry[]}
 */
SimplifiedMNList.prototype.getValidMasternodesList = function getValidMasternodes() {
  return this.validMNs;
};

/**
 * Converts simplified MN list to simplified MN list diff that can be used to serialize data
 * to json, buffer, or a hex string
 * @param {string} [network]
 */
SimplifiedMNList.prototype.toSimplifiedMNListDiff = function toSimplifiedMNListDiff(network) {
  if (!this.cbTx || !this.cbTxMerkleTree) {
    throw new Error("Can't convert MN list to diff - cbTx is missing");
  }
  return SimplifiedMNListDiff.fromObject({
    baseBlockHash: this.baseBlockHash,
    blockHash: this.blockHash,
    cbTx: new Transaction(this.cbTx),
    cbTxMerkleTree: this.cbTxMerkleTree,
    // Always empty, as simplified MN list doesn't have a deleted mn list
    deletedMNs: [],
    mnList: this.mnList,
    merkleRootMNList: this.merkleRootMNList
  }, network);
};

module.exports = SimplifiedMNList;
