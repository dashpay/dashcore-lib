const expect = require('chai').expect;
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const SMNListFixture = require('../fixtures/mnList');
const Transaction = require('../../lib/transaction');

const firstBlockHash = SMNListFixture.getFirstDiff().baseBlockHash;

describe('SimplifiedMNListStore', function () {
  describe('constructor', function () {
    it('Should create an SMLStore with just base diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      expect(SMLStore.baseBlockHash).to.be.equal(firstBlockHash);
    });
    it('Should create an SMLStore with 1st and 2nd diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff(), SMNListFixture.getSecondStoreDiff()]);
      expect(SMLStore.baseBlockHash).to.be.equal(firstBlockHash);
    });
    it('Should initialize a SimplifiedMNListStore with options', function () {
     const options = { maxListsLimit: 20 };
     const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()], options);
     expect(SMLStore.options.maxListsLimit).to.be.equal(20);
    });
  });
  describe('add diffs', function () {
    it('add base diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      const tipHeight = SMLStore.getTipHeight();
      const tipHash = SMLStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getFirstDiff().cbTx);
      const baseHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(baseHeight);
      expect(tipHash).to.equal(SMNListFixture.getFirstDiff().blockHash);
    });
    it('add 2nd diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondDiff());
      const tipHeight = SMLStore.getTipHeight();
      const tipHash = SMLStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getSecondDiff().cbTx);
      const newHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(newHeight);
      expect(tipHash).to.equal(SMNListFixture.getSecondDiff().blockHash);
    });
    it('add 3nd diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondDiff());
      SMLStore.addDiff(SMNListFixture.getThirdDiff());
      const tipHeight = SMLStore.getTipHeight();
      const tipHash = SMLStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getThirdDiff().cbTx);
      const newHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(newHeight);
      expect(tipHash).to.equal(SMNListFixture.getThirdDiff().blockHash);
    });
    it('prune oldest diff and rebase store when reaching maxListsLimit', function () {
      const newMerkleRootAfterPruning = SMNListFixture.getSecondStoreDiff().merkleRootMNList;
      const options = { maxListsLimit: 2 };
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()], options);
      SMLStore.addDiff(SMNListFixture.getSecondStoreDiff());
      SMLStore.addDiff(SMNListFixture.getThirdStoreDiff());
      expect(SMLStore.baseSimplifiedMNList.merkleRootMNList).to.equal(newMerkleRootAfterPruning);
    });
  });
  describe('get SML', function () {
    it('Should get a SimplifiedMNList by block height', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      const height = SMLStore.getTipHeight();
      const currentSML = SMLStore.getSMLbyHeight(height);
      expect(SMLStore.getTipHash()).to.equal(currentSML.blockHash);
    });
    it('Should get the current SML', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondStoreDiff());
      const currentMerkleRootMNList = '57dc239d9740f4e0479599ff5eed69e101051ef340400e3e7b0b1fbf6d4aaf52';
      const currentSML = SMLStore.getCurrentSML();
      expect(currentSML.merkleRootMNList).to.be.equal(currentMerkleRootMNList);
    });
    it('Should through an error when trying to get an SML at an unknown height', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondStoreDiff());
      const height = 11111;
      expect(function () {
        SMLStore.getSMLbyHeight(height);
      }).to.throw('unable to construct SML at this height');
    });
  });
});
