/* eslint-disable */
var expect = require('chai').expect;
var SMNListFixture = require('../fixtures/mnList');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');

describe('SimplifiedMNList', function() {
  describe('applyDiff', function () {
    it('Should apply diff and sort MN entries', function () {
      var mnList = new SimplifiedMNList();
      var diff = SMNListFixture.getFirstDiff();

      mnList.applyDiff(diff);
      expect(mnList.mnList.length).to.be.equal(diff.mnList.length);
      // Since mn list is sorted and diff isn't, we need to check the list that way
      mnList.mnList.forEach(function (entry) {
        var diffIndex = diff.mnList.findIndex(function (diffEntry) { return diffEntry.proRegTxHash === entry.proRegTxHash });
        // toObject since diff is just JSON, while entry in the list is an instance of SimplifiedMNListEntry
        expect(entry.toObject()).to.be.deep.equal(diff.mnList[diffIndex]);
      });
      expect(mnList.calculateMerkleRoot()).to.be.equal(diff.merkleRootMNList);
    });
    it('Should update entries', function() {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var mnsCountInTheFirstDiff = SMNListFixture.getFirstDiff().mnList.length;
      var mnsCountInTheSecondDiff = SMNListFixture.getSecondDiff().mnList.length;
      var mnsDeleted = SMNListFixture.getSecondDiff().deletedMNs.length;

      mnList.applyDiff(SMNListFixture.getSecondDiff());

      // Check that there are masternodes to be deleted
      expect(mnsDeleted).to.be.equal(1);
      // Check that there are masternodes to be updated - resulting list should be shorter than two diff - deleted count
      expect(mnsCountInTheFirstDiff + mnsCountInTheSecondDiff - mnsDeleted).to.be.above(mnList.mnList.length);
      expect(mnList.mnList.length).to.be.equal(SMNListFixture.getFirstTwoDiffsCombined().mnList.length);
      // Check that calculated merkle root is the same as merkle root in the latest applied diff
      expect(mnList.calculateMerkleRoot()).to.be.equal(SMNListFixture.getSecondDiff().merkleRootMNList);
    });
    it("Should throw an error if calculated merkle root doesn't match merkle root in the diff", function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      expect(function () {
        mnList.applyDiff(SMNListFixture.getThirdDiff());
      }).to.throw('Merkle root from the diff doesn\'t match calculated merkle root after diff is applied');
    });
  });
  describe('calculateMerkleRoot', function () {
    it('Should calculate merkle root', function () {
      var mnListJSON = SMNListFixture.getMNListJSON();
      var mnList = new SimplifiedMNList();

      mnList.applyDiff(mnListJSON);
      var calculatedRoot = mnList.calculateMerkleRoot();

      expect(calculatedRoot).to.be.equal(mnListJSON.merkleRootMNList);
    });
  });
  describe('verify', function () {

  });
  describe('toSmplifiedMNListDiff', function () {
    it('Should return a simplified masternode lits diff', function () {

    });
  });
  describe('getValidMasternodes', function () {

  });
});
