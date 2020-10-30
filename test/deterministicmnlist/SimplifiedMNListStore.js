const expect = require('chai').expect;
const constants = require('../../lib/constants');
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const SMNListFixture = require('../fixtures/mnList');
const Transaction = require('../../lib/transaction');

let smlDiffArray;



describe('SimplifiedMNListStore', function () {
  this.timeout(5000);

  beforeEach(()=>{
    smlDiffArray = SMNListFixture.getChainlockDiffArray();
  });

  describe('constructor', function () {
    it(`Should create an SMLStore with a diff of at least ${constants.LLMQ_SIGN_HEIGHT_OFFSET * 2} elements`, function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      const firstBlockHash = SMNListFixture.getChainlockDiff0().baseBlockHash;
      expect(smlStore.baseBlockHash).to.be.equal(firstBlockHash);
    });
    it('Should throw and error if initial diff param has less than required elements', function () {
      expect(function () {
        new SimplifiedMNListStore([SMNListFixture.getFirstDiff()]);
      }).to.throw(`SimplifiedMNListStore requires an array with at least ${constants.LLMQ_SIGN_HEIGHT_OFFSET * 2} elements to create`);
    });
    it('Should throw and error if initial diff param has exactly one element less than required elements', function () {
      smlDiffArray.pop();
      expect(function () {
        new SimplifiedMNListStore(smlDiffArray);
      }).to.throw(`SimplifiedMNListStore requires an array with at least ${constants.LLMQ_SIGN_HEIGHT_OFFSET * 2} elements to create`);
    });
    it('Should initialize a SimplifiedMNListStore with options', function () {
     const options = { maxListsLimit: 20 };
     const smlStore = new SimplifiedMNListStore(smlDiffArray, options);
     expect(smlStore.options.maxListsLimit).to.be.equal(20);
    });
  });
  describe('add diffs', function () {
    it('add one diff to base', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      const tipHeight = smlStore.getTipHeight();
      const tipHash = smlStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getChainlockDiff16().cbTx);
      const baseHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(baseHeight);
      expect(tipHash).to.equal(SMNListFixture.getChainlockDiff16().blockHash);
    });
    it('add two diff to base', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      smlStore.addDiff(SMNListFixture.getChainlockDiff17());
      const tipHeight = smlStore.getTipHeight();
      const tipHash = smlStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getChainlockDiff17().cbTx);
      const baseHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(baseHeight);
      expect(tipHash).to.equal(SMNListFixture.getChainlockDiff17().blockHash);
    });
    it('add three diff to base', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      smlStore.addDiff(SMNListFixture.getChainlockDiff17());
      smlStore.addDiff(SMNListFixture.getChainlockDiff18());
      const tipHeight = smlStore.getTipHeight();
      const tipHash = smlStore.getTipHash();
      const cbTx = new Transaction(SMNListFixture.getChainlockDiff18().cbTx);
      const baseHeight = cbTx.extraPayload.height;
      expect(tipHeight).to.equal(baseHeight);
      expect(tipHash).to.equal(SMNListFixture.getChainlockDiff18().blockHash);
    });
    it('prune oldest diff and rebase store when reaching maxListsLimit', function () {
      const newMerkleRootAfterPruning = SMNListFixture.getChainlockDiff2().merkleRootMNList;
      const options = { maxListsLimit: 16 };
      const smlStore = new SimplifiedMNListStore(smlDiffArray, options);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      smlStore.addDiff(SMNListFixture.getChainlockDiff17());
      expect(smlStore.baseSimplifiedMNList.merkleRootMNList).to.equal(newMerkleRootAfterPruning);
    });
  });
  describe('get SML', function () {
    it('Should get a SimplifiedMNList by block height', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      const height = smlStore.getTipHeight();
      const currentSML = smlStore.getSMLbyHeight(height);
      expect(smlStore.getTipHash()).to.equal(currentSML.blockHash);
    });
    it('Should get the current SML', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      const currentMerkleRootMNList = 'fff875a59e7fa605834e892e6a4b967234582c95dba4237cb8a417a294faf076';
      const currentSML = smlStore.getCurrentSML();
      expect(currentSML.merkleRootMNList).to.be.equal(currentMerkleRootMNList);
    });
    it('Should through an error when trying to get an SML at an unknown height', function () {
      const smlStore = new SimplifiedMNListStore(smlDiffArray);
      smlStore.addDiff(SMNListFixture.getChainlockDiff16());
      const height = 11111;
      expect(function () {
        smlStore.getSMLbyHeight(height);
      }).to.throw('unable to construct SML at this height');
    });
  });
});
