/* eslint-disable */

var SimplifiedMNListDiff = require('./SimplifiedMNListDiff');

function DeterministicMNList() {

}

/**
 *
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
 */
DeterministicMNList.prototype.applyDiff = function applyDiff(simplifiedMNListDiff) {
  // This will copy instance of SimplifiedMNListDiff or create a new instance if serialized data is passed
  var diff = new SimplifiedMNListDiff(simplifiedMNListDiff);
};

DeterministicMNList.prototype.verify = function verify() {

};

module.exports = DeterministicMNList;
