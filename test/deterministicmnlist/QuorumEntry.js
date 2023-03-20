/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var QuorumEntry = require('../../lib/deterministicmnlist/QuorumEntry');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');
var SMNListFixture = require('../fixtures/mnList');
const DashcoreLib = require("../../index");

describe('QuorumEntry', function () {
  this.timeout(10000);

  let quorumEntryJSON;
  let quorumEntryWithNonMaxSignersCount;
  let quorumEntryHex;
  let quorumEntryHash;
  let commitmentHash;
  let selectionModifier;
  let quorumEntryJSONV4;
  let quorumEntryHexV4;

  beforeEach(() => {
    DashcoreLib.Networks.disableRegtest();

    quorumEntryJSON = {
      "version": 3,
      "llmqType": 107,
      "quorumHash": "0000031259a3c8f0b098645aefadcd45290fc3728d0e8039fdfc6eafe4964d59",
      "quorumIndex": 0,
      "signersCount": 12,
      "signers": "ff0f",
      "validMembersCount": 12,
      "validMembers": "ff0f",
      "quorumPublicKey": "839c408baa3581ae6742f820d5a6fb725c7fce900eccc513b5f5136c2b8ff4c62767b0b0a5ca42a2b7c152c7c925c484",
      "quorumVvecHash": "0fd9a48bbd3a4ccef6b40c5258d50353ae5c4d8584d4e30220265dabeba44842",
      "quorumSig": "b1788462de5bf205309202eb9fdd333503d8c135edd4749975876fda3a94dd65786f2d73760aa9d09ab5034806726a4407e968efffadd6ed30b5a2c90dfaa5ff3ab16617e2b18f1f146f96924c77d19925d805085fd14cf3140251786c1cb6ff",
      "membersSig": "b227ef17972211381d1f57e71ad61665e98e2d34780e3e20f33466a979504ac103a369ff8ee4b513e4ead4b8f9322cd7081879241eeeca484ccb5b20ea98248a2eaa3bc68a2ab371b9fac24cd3b4b40c382db04ecd78f17950ca2dd082b12a89"
    };

    quorumEntryWithNonMaxSignersCount = {
      "version": 4,
      "llmqType": 105,
      "quorumHash": "0000017775d588b653c0d458c3c491f39eae8d1cfddd67c19bc3554345e22842",
      "quorumIndex": 1,
      "signersCount": 8,
      "signers": "ff",
      "validMembersCount": 8,
      "validMembers": "ff",
      "quorumPublicKey": "a75c3d17dd5a8c02788355f3a7cfd804024621222324ee00c38830697c490860325ad105a80e2694cadad6309f1c2846",
      "quorumVvecHash": "fe86c3a0e990f91b2127e056d9dcf772370905101984893cc423f30a53749204",
      "quorumSig": "a9171eff96847f88994c8b114a4690b4f528f69f52de8bbd7127579dee9705408112323027fdb9463095aaf1fb59a3aa1810443de37bded5c0f1656cd994a3dcc00214b605ecf662345d971036fb38b5443b7f0615fd109dd7defa87dc8af198",
      "membersSig": "8e71192b3007695055e99deeb720f6402b8e6275809b0b6ae4c8e46f9166368f9ff74573097242cde8c8260b1bf9ba3802f809cd3a502c8f1844f74681d42b15afd70c2c1f43870f05a5bfdc5f7fa163e15ea93ecd9f2f62263d196622ca2066"
    };

    quorumEntryHex =
      '03006b594d96e4af6efcfd39800e8d72c30f2945cdadef5a6498b0f0c8a359120300000cff0f0cff0f839c408baa3581ae6742f820d5a6fb725c7fce900eccc513b5f5136c2b8ff4c62767b0b0a5ca42a2b7c152c7c925c4844248a4ebab5d262002e3d484854d5cae5303d558520cb4f6ce4c3abd8ba4d90fb1788462de5bf205309202eb9fdd333503d8c135edd4749975876fda3a94dd65786f2d73760aa9d09ab5034806726a4407e968efffadd6ed30b5a2c90dfaa5ff3ab16617e2b18f1f146f96924c77d19925d805085fd14cf3140251786c1cb6ffb227ef17972211381d1f57e71ad61665e98e2d34780e3e20f33466a979504ac103a369ff8ee4b513e4ead4b8f9322cd7081879241eeeca484ccb5b20ea98248a2eaa3bc68a2ab371b9fac24cd3b4b40c382db04ecd78f17950ca2dd082b12a89';
    quorumEntryHash =
      'f6c2a8956a8c12f12630d02ee8594cbc7435a1159d7e6af1e45e5a02cd140359';
    commitmentHash =
      '4f227cd4fe576f5a75d3142c7eda77cf1393a8273efb1474ff06ac28bc5968dc';
    selectionModifier =
      '0b864448a6e57e3e56ad6751d887d0f658d6bcb0441086d11890c57fdeecc2d1';

    quorumEntryJSONV4 = {
      "version": 4,
      "llmqType": 105,
      "quorumHash": "00000066a5f58f6328e44b13e912433e874695566b65da0b2b240ed1247e759e",
      "quorumIndex": 0,
      "signersCount": 8,
      "signers": "ff",
      "validMembersCount": 8,
      "validMembers": "ff",
      "quorumPublicKey": "a8105b74bbbf27bd5537e26eb58df129b6321b418be10ae0451d4f3af5ff30d45b53ff0aa8717d2d842987269337be09",
      "quorumVvecHash": "064c248453ed0c11413f3e8ad583a55b3feea6cff9b5c9758125b45a98061ad3",
      "quorumSig": "ab35d1a99e8643e62cb482aa7de9f7298ff985d3a81b7d50c1df99391895bad28b8adda48dac3feeb0727009eceec5d40fe74a9ea47a14c2c41e45746d9497bcacd11cac52a3e0d8e168d17ea83086a350ddf4c3648a48ad7244e59c59c5c093",
      "membersSig": "91653ceb3c87cd4bbbf9bb8a9133cf2bcf3894ee1188fbc308e7c845861deea12485761bc5fb9577e0eeb5c7535bbd970be41447e17f8f98b619518a729b6da39035796856c16c63023b3091a27adf2d0bd957276590bd89b3d32f2afe14db36"
    };

    quorumEntryHexV4 = '0400699e757e24d10e242b0bda656b569546873e4312e9134be428638ff5a566000000000008ff08ffa8105b74bbbf27bd5537e26eb58df129b6321b418be10ae0451d4f3af5ff30d45b53ff0aa8717d2d842987269337be09d31a06985ab4258175c9b5f9cfa6ee3f5ba583d58a3e3f41110ced5384244c06ab35d1a99e8643e62cb482aa7de9f7298ff985d3a81b7d50c1df99391895bad28b8adda48dac3feeb0727009eceec5d40fe74a9ea47a14c2c41e45746d9497bcacd11cac52a3e0d8e168d17ea83086a350ddf4c3648a48ad7244e59c59c5c09391653ceb3c87cd4bbbf9bb8a9133cf2bcf3894ee1188fbc308e7c845861deea12485761bc5fb9577e0eeb5c7535bbd970be41447e17f8f98b619518a729b6da39035796856c16c63023b3091a27adf2d0bd957276590bd89b3d32f2afe14db36';
  });

  describe('fromBuffer', function () {
    it('Should be able to parse data from a buffer', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(quorumEntryJSON);
    });
    it('Should be able to generate correct hash', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      expect(entry.calculateHash()).to.be.deep.equal(
        Buffer.from(quorumEntryHash, 'hex')
      );
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
      expect(entryCommitmentHash).to.be.deep.equal(
        Buffer.from(commitmentHash, 'hex')
      );
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
    this.timeout(6000);

    it('Should verify a threshold signature', function () {
      var entry = new QuorumEntry(quorumEntryJSON);
      return entry.isValidQuorumSig().then((res) => {
        expect(res).to.be.true;
      });
    });
    it('Should verify an aggregated member signature', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      mnList.applyDiff(SMNListFixture.getSecondDiff());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff());
      var entry = new QuorumEntry(quorumEntryJSON);
      return entry.isValidMemberSig(mnList).then((res) => {
        expect(res).to.be.true;
      });
    });
    it.skip('Should verify an aggregated member signature for llmq 105', function () {
      // TODO implement me
    });
    it.skip('Should verify an aggregated member signature with not all members having signed', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getMNListJSON());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff());
      var entry = new QuorumEntry(quorumEntryWithNonMaxSignersCount);
      return entry.isValidMemberSig(mnList).then((res) => {
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
      return entry.verify(mnList).then((res) => {
        expect(res).to.be.true;
        expect(entry.isVerified).to.be.true;
      });
    });
  });
  describe('to buffer version 4', () => {
    it('should be able to generate correct buffer', () => {
      var entry = QuorumEntry(quorumEntryJSONV4);
      var buffer = entry.toBuffer();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHexV4, 'hex'));
    });
  });
  describe('fromBuffer version 2', () => {
    it('should be able to parse data from a buffer', () => {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHexV4, 'hex'));
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(quorumEntryJSONV4);
    });
  });
});
