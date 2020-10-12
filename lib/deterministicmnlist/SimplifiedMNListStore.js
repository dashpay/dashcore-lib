const SimplifiedMNList = require('./SimplifiedMNList');
const SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
const constants = require('../constants');

function SimplifiedMNListStore(simplifiedMNListDiff) {

  const diff = new SimplifiedMNListDiff(simplifiedMNListDiff, this.network);
  this.network = diff.network;


  if (diff.baseBlockHash === constants.NULL_HASH) {

    /* If the base block hash is a null hash, then this is the first time we apply any diff.
    * If we apply diff to the list for the first time, than diff's base block hash would be the base block hash
    * for the whole list.
    * */

    this.baseBlockHash = diff.baseBlockHash;
    // now store the first diff
    this.firstSimplifiedMNList = new SimplifiedMNList(diff);
  }

  if (!this.firstSimplifiedMNList) {
    throw new Error("no initial diff has been provided");
  }

}

/**
 * @param {SimplifiedMNListDiff} diff
 * @return {Boolean}
 */
SimplifiedMNListStore.storeDiff = function storeDiff(diff) {
  // store diff
  return true;
};
