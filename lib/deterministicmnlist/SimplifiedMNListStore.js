const SimplifiedMNList = require('./SimplifiedMNList');
const SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
const constants = require('../constants');

const { SMLSTORE_MAX_DIFFS } = constants;

/**
 * @class SimplifiedMNListStore
 * @param {Array.<SimplifiedMNListDiff>} diffArray - an array of simplifiedMNListDiff
 * @constructor
 * @property {string} network
 * @property {Array.<Object>} diffStore - an array of diff entries
 * @property {SimplifiedMNList} baseSimplifiedMNList - the base SML
 * @property {number} baseHeight - the block height of the base SML
 * @property {string} baseBlockHash - sha256, the block hash of the base SML
 */
function SimplifiedMNListStore(diffArray) {
  const firstDiff = new SimplifiedMNListDiff(diffArray[0], this.network);
  this.network = firstDiff.network;

  // TODO: check also for genesis hash
  if (firstDiff.baseBlockHash === constants.NULL_HASH) {
    this.diffStore = [];

    // always store the first diff as a root to build on
    this.baseSimplifiedMNList = new SimplifiedMNList(firstDiff);
    this.baseHeight = firstDiff.cbTx.extraPayload.height;
    this.baseBlockHash = firstDiff.baseBlockHash;
  }

  if (!this.baseSimplifiedMNList) {
    throw new Error('no initial diff has been provided');
  }

  if (diffArray.length > 1) {
    diffArray.forEach((diff) => {
      this.addDiff(diff);
    });
  }
}

/**
 * Adds a new SimplifiedMNListDiff to the store.
 * If SMLSTORE_MAX_DIFFS reached it drops the oldest
 * @param {SimplifiedMNListDiff} diff
 */
SimplifiedMNListStore.prototype.addDiff = function addDiff(diff) {
  if (!this.baseSimplifiedMNList) {
    throw new Error('no initial diff has been provided');
  }

  const { height } = diff.cbTx.extraPayload;
  if (this.diffStore.length >= SMLSTORE_MAX_DIFFS) {
    this.baseSimplifiedMNList = this.applyDiffs(this.diffStore[0]);
    this.baseHeight = this.baseHeight + 1;
    this.diffStore.shift();
  }
  this.diffStore.push({ height, diff });
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
 * Returns a SimplifiedMNList by block height
 * @param {number} height
 * @returns {SimplifiedMNList}
 */
SimplifiedMNListStore.prototype.getSMLbyHeight = function getSMLbyHeight(height) {
  const diffs = this.getSMLDiffbyHeightRange(this.baseHeight, height);
  return this.applyDiffs(diffs);
};

/**
 * Applies an array of sequential SimplifiedMNListDiffs to the first base SimplifiedMNList
 * @param {SimplifiedMNListDiff[]} diffs
 * @returns {SimplifiedMNList}
 */
SimplifiedMNListStore.prototype.applyDiffs = function applyAllDiffs(diffs) {
  const currentSML = new SimplifiedMNList(this.baseSimplifiedMNList, this.network);
  diffs.forEach((diff) => {
    currentSML.applyDiff(diff);
  });
  return currentSML;
};

module.exports = SimplifiedMNListStore;
