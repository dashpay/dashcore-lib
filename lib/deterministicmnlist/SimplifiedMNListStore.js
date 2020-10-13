const SimplifiedMNList = require('./SimplifiedMNList');
const SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
const constants = require('../constants');

function SimplifiedMNListStore(simplifiedMNListDiff) {
  const diff = new SimplifiedMNListDiff(simplifiedMNListDiff, this.network);
  this.network = diff.network;

  // TODO: check also for genesis hash
  if (diff.baseBlockHash === constants.NULL_HASH) {
    this.baseBlockHash = diff.baseBlockHash;
    this.diffStore = [];

    // always store the first diff as a root to build on
    this.firstSimplifiedMNList = new SimplifiedMNList(diff);
  }

  if (!this.firstSimplifiedMNList) {
    throw new Error('no initial diff has been provided');
  }
}

/**
 * @param {SimplifiedMNListDiff} diff
 */
SimplifiedMNListStore.addDiff = function addDiff(diff) {
  if (!this.firstSimplifiedMNList) {
    throw new Error('no initial diff has been provided');
  }

  const { height } = diff.cbTx.extraPayload;
  this.diffStore.push({ height, diff });
};

/**
 * Returns a SimplifiedMNListDiff entry by height
 * @param {number} height
 * @returns {SimplifiedMNListDiff}
 */
SimplifiedMNListStore.prototype.getSMLDiffbyHeight = function getSMLDiffbyHeight(height) {
  return this.diffStore.find(diffEntry => (
    diffEntry.height === height).diff);
};

/**
 * Returns a SimplifiedMNListDiff entry by height
 * @param {number} startHeight
 * @param {number} endHeight
 * @returns {SimplifiedMNListDiff[]}
 */
SimplifiedMNListStore.prototype.getSMLDiffbyHeightRange = function getSMLDiffbyHeightRange(startHeight, endHeight) {
  return this.diffStore.filter(diffEntry => (
    diffEntry.height >= startHeight && diffEntry.height <= endHeight).diff);
};

/**
 * Returns a SimplifiedMNList by height
 * @param {number} height
 * @returns {SimplifiedMNList}
 */
SimplifiedMNListStore.prototype.getSMLbyHeight = function getSMLbyHeight(height) {
  const diff = this.getSMLDiffbyHeight(height);

  // TODO: merge all diffs in between the first and the last and apply result to the first
  return new SimplifiedMNList(diff);
};
