const expect = require('chai').expect;
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');
const SMNListFixture = require('../fixtures/mnList');
const Transaction = require('../../lib/transaction');

describe('SimplifiedMNListStore', function () {
  describe('constructor', function () {
    it('Should create an SMLStore with just base diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      expect(SMLStore.baseBlockHash).to.be.equal(SMNListFixture.getFirstDiff().baseBlockHash);
    });
    it('Should create an SMLStore with 1st and 2nd diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff(), SMNListFixture.getSecondDiff()]);
      expect(SMLStore.baseBlockHash).to.be.equal(SMNListFixture.getFirstDiff().baseBlockHash);
    });
    it('Should create an SMLStore with 3 diffs', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff(), SMNListFixture.getSecondDiff(), SMNListFixture.getThirdDiff()]);
      expect(SMLStore.baseBlockHash).to.be.equal(SMNListFixture.getFirstDiff().baseBlockHash);
    });
    it('Should initialize a SimplifiedMNListStore with options', function () {
     const optioms = { maxListsLimit: 20 };
     const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()], optioms);
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
  });
  describe('get SML by height', function () {
    it('Should get a SimplifiedMNList by block height with only base diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      const height = SMLStore.getTipHeight();
      const currentSML = SMLStore.getSMLbyHeight(height);
      expect(SMLStore.getTipHash()).to.equal(currentSML.blockHash);
    });
    it('Should get a SimplifiedMNList by block height with two diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondDiff());
      const height = SMLStore.getTipHeight();
      const currentSML = SMLStore.getSMLbyHeight(height);
      expect(SMLStore.getTipHash()).to.equal(currentSML.blockHash);
    });
    it('Should get a SimplifiedMNList by block height with three diff', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondDiff());
      SMLStore.addDiff(SMNListFixture.getThirdDiff());
      const height = SMLStore.getTipHeight();
      const currentSML = SMLStore.getSMLbyHeight(height);
      expect(SMLStore.getTipHash()).to.equal(currentSML.blockHash);
    });
    it('Should through an error when trying to get an SML at an unknown height', function () {
      const SMLStore = new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      SMLStore.addDiff(SMNListFixture.getSecondDiff());
      const height = 11111;
      expect(function () {
        SMLStore.getSMLbyHeight(height);
      }).to.throw('unable to construct SML at this height');
    });
  });
});
