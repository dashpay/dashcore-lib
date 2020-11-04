/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var QuorumEntry = require('../../lib/deterministicmnlist/QuorumEntry');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');
var SMNListFixture = require('../fixtures/mnList');

var quorumEntryJSON = {
  "version": 1,
  "llmqType": 1,
  "quorumHash": "0000000000c1c305a88441ce9a27a51fbad94555e50aaf6b61f84866bf56b160",
  "signersCount": 50,
  "signers": "ffffffffffff03",
  "validMembersCount": 50,
  "validMembers": "ffffffffffff03",
  "quorumPublicKey": "8fe19adca131e5a5dbbfb5ae4022abb6838edc3ac13820affe7086ffe7e4d99b9374a18bd558b878f726fd9c5299b5c3",
  "quorumVvecHash": "97ba33c3abbbf740f66c712db3e8886678f96cc5d9c57ef1769a072efea7daf3",
  "quorumSig": "1527b12834578efb34480234293215cdaaba66ae31804ce57c8cf34ff0cf2b995a974d24c5f66bfe28ae7cd54c945fc8126465f4cf5a32e02d903be19d00e473fb93eaae9c28d9c80097e3410dbdd6e8dd223fde1a3be30a1fda688e0c9a087c",
  "membersSig": "82ceec940dd23b3c50ace0645759d4cd7ea7f6153813018d265245e81bf7673b8c2d664e94f5f506655654ee39d2689a007d98513d274aae8dc31ebb0138756a768005774cc718ba55e18e9b442dbb638d54c7ff256e0d997e3544581497f5c0"
};

var quorumEntryWithNonMaxSignersCount = {
  "version": 1,
  "llmqType": 1,
  "quorumHash": "000000000118567b7c0694aacf26d738b939344eccce0f521b8b4ca3b8e29b6e",
  "signersCount": 49,
  "signers": "fffffbffffff03",
  "validMembersCount": 49,
  "validMembers": "fffffbffffff03",
  "quorumPublicKey": "0b48de5707acb3f6e5536daa16f54cd31047a22ea81450ea021364b22c3f60fabde51873a7eef595254e2e9e4ea65427",
  "quorumVvecHash": "98b4ae23bf8db2b2ab4e1534687d55913926665319187111c78160f52ff1202d",
  "quorumSig": "07e14170f04c3296a4ee4398c9e67701357e6d4bf397ef785839623d93b99d76b91a9fcd952b9dcca8e4a0b95e10d385122a85b53ff061899d19403ab04f07471567b58c907233ab9457e00038b4686cad7f64201e854489a47ac4a4aadb84a3",
  "membersSig": "842ec892233e43c4c85cb4c1b47aa07ab7bbb9da5c3afb23c2b6d0157a74dc1f92d99c523736705be798b763282fe2a40802a7472977daa2c24c1ee4aa3f36753d1befef21078b41e0fbb4fe680fe0a6dc6649bdafaed84533b3771cacdef433"
};

var quorumEntryHex = "01000160b156bf6648f8616baf0ae55545d9ba1fa5279ace4184a805c3c1000000000032ffffffffffff0332ffffffffffff038fe19adca131e5a5dbbfb5ae4022abb6838edc3ac13820affe7086ffe7e4d99b9374a18bd558b878f726fd9c5299b5c3f3daa7fe2e079a76f17ec5d9c56cf9786688e8b32d716cf640f7bbabc333ba971527b12834578efb34480234293215cdaaba66ae31804ce57c8cf34ff0cf2b995a974d24c5f66bfe28ae7cd54c945fc8126465f4cf5a32e02d903be19d00e473fb93eaae9c28d9c80097e3410dbdd6e8dd223fde1a3be30a1fda688e0c9a087c82ceec940dd23b3c50ace0645759d4cd7ea7f6153813018d265245e81bf7673b8c2d664e94f5f506655654ee39d2689a007d98513d274aae8dc31ebb0138756a768005774cc718ba55e18e9b442dbb638d54c7ff256e0d997e3544581497f5c0";
var quorumEntryHash = "9fc6855eae595e1cdafe7e80ddd1473d09ffa0958ef2c053c8c5383c39a65a83";
var commitmentHash = "bc8c5dc5975ce6c4988ce8506ce6a4ec59b3232a8715aa2ffaeeebab8d71b533";
var selectionModifier = "c6a87d306a29918722342ddd612262356097b50b3d67476f073c33947aee32f0";

describe('QuorumEntry', function () {
  describe('fromBuffer', function () {
    it('Should be able to parse data from a buffer', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(quorumEntryJSON)
    });
    it('Should be able to generate correct hash', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      expect(entry.calculateHash()).to.be.deep.equal(Buffer.from(quorumEntryHash, 'hex'));
    });
  });
  describe('to buffer', function () {
    it('Should be able to generate correct buffer', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var buffer = entry.toBuffer();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHex, 'hex'));
    });
  });
  describe('to buffer for hashing', function () {
    it('Should be able to generate correct buffer for hashing', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var buffer = entry.toBufferForHashing();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHex, 'hex'));
    });
  });
  describe('generate commitmentHash', function () {
    it('Should be able to generate a correct commitmentHash', function () {
      var entry = new QuorumEntry(quorumEntryJSON);
      var entryCommitmentHash = entry.getCommitmentHash();
      expect(entryCommitmentHash).to.be.deep.equal(Buffer.from(commitmentHash, 'hex'));
    });
  });
  describe('quorum members', function () {
    it('Should generate the correct selectionModifier', function () {
      var entry = new QuorumEntry(quorumEntryJSON);
      var res = entry.getSelectionModifier();
      expect(res).to.be.deep.equal(Buffer.from(selectionModifier, 'hex'));
    });
    it('Should get the correct list of quorum members', function () {
      var sortedMemberHashes = SMNListFixture.getSortedMemberProRegTxHashes();
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      mnList.applyDiff(SMNListFixture.getSecondDiff());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff());
      var entry = new QuorumEntry(quorumEntryJSON);
      var members = entry.getAllQuorumMembers(mnList);
      var calculatedMemberHashes = [];
      members.forEach(function (member) {
        calculatedMemberHashes.push(member.proRegTxHash);
      });
      expect(calculatedMemberHashes).to.be.deep.equal(sortedMemberHashes);
    });
  });
  describe('quorum signatures', function () {
    it('Should verify a threshold signature', function () {
      var entry = new QuorumEntry(quorumEntryJSON);
      return entry.isValidQuorumSig()
        .then((res) => {
          expect(res).to.be.true;
        });
    });
    it('Should verify an aggregated member signature', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      mnList.applyDiff(SMNListFixture.getSecondDiff());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff());
      var entry = new QuorumEntry(quorumEntryJSON);
      return entry.isValidMemberSig(mnList)
        .then((res) => {
          expect(res).to.be.true;
        });
    });
    it('Should verify an aggregated member signature with not all members having signed', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      mnList.applyDiff(SMNListFixture.getSecondDiff());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff2());
      var entry = new QuorumEntry(quorumEntryWithNonMaxSignersCount);
      return entry.isValidMemberSig(mnList)
        .then((res) => {
          expect(res).to.be.true;
        });
    });
    it('Should verify both signatures of the quorum and set isVerified to true', function () {
      this.timeout(3000);
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      mnList.applyDiff(SMNListFixture.getSecondDiff());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff());
      var entry = new QuorumEntry(quorumEntryJSON);
      expect(entry.isVerified).to.be.false;
      return entry.verify(mnList)
        .then((res) => {
          expect(res).to.be.true;
          expect(entry.isVerified).to.be.true;
        });
    });
  });
});
