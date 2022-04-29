/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var QuorumEntry = require('../../lib/deterministicmnlist/QuorumEntry');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');
var SMNListFixture = require('../fixtures/mnList');

var quorumEntryJSON = {
  version: 1,
  llmqType: 1,
  quorumHash:
    '0000000000c1c305a88441ce9a27a51fbad94555e50aaf6b61f84866bf56b160',
  signersCount: 50,
  signers: 'ffffffffffff03',
  validMembersCount: 50,
  validMembers: 'ffffffffffff03',
  quorumPublicKey:
    '8fe19adca131e5a5dbbfb5ae4022abb6838edc3ac13820affe7086ffe7e4d99b9374a18bd558b878f726fd9c5299b5c3',
  quorumVvecHash:
    '97ba33c3abbbf740f66c712db3e8886678f96cc5d9c57ef1769a072efea7daf3',
  quorumSig:
    '1527b12834578efb34480234293215cdaaba66ae31804ce57c8cf34ff0cf2b995a974d24c5f66bfe28ae7cd54c945fc8126465f4cf5a32e02d903be19d00e473fb93eaae9c28d9c80097e3410dbdd6e8dd223fde1a3be30a1fda688e0c9a087c',
  membersSig:
    '82ceec940dd23b3c50ace0645759d4cd7ea7f6153813018d265245e81bf7673b8c2d664e94f5f506655654ee39d2689a007d98513d274aae8dc31ebb0138756a768005774cc718ba55e18e9b442dbb638d54c7ff256e0d997e3544581497f5c0',
};

var quorumEntryWithNonMaxSignersCount = {
  version: 1,
  llmqType: 1,
  quorumHash:
    '00000140186ff65a6826507abd20f95abf50f355c51c7efaa88e1d14affd087b',
  signersCount: 49,
  signers: 'fffffffffdff03',
  validMembersCount: 50,
  validMembers: 'ffffffffffff03',
  quorumPublicKey:
    '02b1c4dfc04d0c2abf5b40ead025f4dfd30cd4bb1748964b242d353ab701db314c7dcdd7f374037b2e7041cdab9dae95',
  quorumVvecHash:
    '96ea54661e3c4cdda61f761e2ae787ed755cf2c9706da55e79699b37a1e3cbb8',
  quorumSig:
    '8d6dfe8077eeb172428e9031127b3a6c7dd7420804084cca21cd0748e9fe8c21a4b6f45d1c4ca7941b77da7b0368a39700621283870fded863602ab91da46e481852b18421f7c71edb82955bf0da9f4628866174ec27cdc8159f50bf0a83fe30',
  membersSig:
    '98df7d8648e0810cf564bab77175f5007f7714f9e43bde627f1a54b1851428750231b4634329b097eabefdf7c1f9497e07dddbab3fc7903ad57add36856a13dae06ec7ddea9bfc4c68133be4c85ab8354682de7be3d994f336a49d71c37122b3',
};

var quorumEntryHex =
  '01000160b156bf6648f8616baf0ae55545d9ba1fa5279ace4184a805c3c1000000000032ffffffffffff0332ffffffffffff038fe19adca131e5a5dbbfb5ae4022abb6838edc3ac13820affe7086ffe7e4d99b9374a18bd558b878f726fd9c5299b5c3f3daa7fe2e079a76f17ec5d9c56cf9786688e8b32d716cf640f7bbabc333ba971527b12834578efb34480234293215cdaaba66ae31804ce57c8cf34ff0cf2b995a974d24c5f66bfe28ae7cd54c945fc8126465f4cf5a32e02d903be19d00e473fb93eaae9c28d9c80097e3410dbdd6e8dd223fde1a3be30a1fda688e0c9a087c82ceec940dd23b3c50ace0645759d4cd7ea7f6153813018d265245e81bf7673b8c2d664e94f5f506655654ee39d2689a007d98513d274aae8dc31ebb0138756a768005774cc718ba55e18e9b442dbb638d54c7ff256e0d997e3544581497f5c0';
var quorumEntryHash =
  '9fc6855eae595e1cdafe7e80ddd1473d09ffa0958ef2c053c8c5383c39a65a83';
var commitmentHash =
  'bc8c5dc5975ce6c4988ce8506ce6a4ec59b3232a8715aa2ffaeeebab8d71b533';
var selectionModifier =
  'c6a87d306a29918722342ddd612262356097b50b3d67476f073c33947aee32f0';

var quorumEntryJSONV2 = {
  version: 2,
  llmqType: 101,
  quorumHash: '000001ed19f47caa2fd4afb01581046ee01dac8179e95f6a0bf2c6fbef3a805d',
  signersCount: 9,
  signers: 'ff01',
  validMembersCount: 9,
  validMembers: 'ff01',
  quorumPublicKey: '89dc2e41ac5830a69bef0028541fc34af43904ab8a3b21d7896ef7aba74034936c9a72dcdefd9fa55d521d6017eb2e6b',
  quorumVvecHash: 'e0a5fad7ec75a62fcec8ba8f76cfdb49768695d8001741855ff3e29c00934eda',
  quorumSig: '030fc3fc6a9dd3ce747b116d07ad3c7d00fec6e03d5c4b54d90861426a8f0a1c4ce255e0cacc03e55156090e7f3fe0a60cdd9c0ed1b291725222524c2022cd5f62a557419be98017f0dd0247a63fba192160bc0945237b8aba9f8edcc60b5338',
  membersSig: '9849e7bee57f641dba2f2ad5f60e4beccb88fc155543bca9a25e30a55cacce9d8c82f4a6b1dbcc883fe03b0be716d1f808b6a66c1369a3864a35979a43ea5be0295c4d82e72dbf057f112f40a7a23f4a9087a2cc1076bbbe40dffa3c1c7f332f',
  quorumIndex: 1
};

var quorumEntryHexV2 = '0200655d803aeffbc6f20b6a5fe97981ac1de06e048115b0afd42faa7cf419ed010000010009ff0109ff0189dc2e41ac5830a69bef0028541fc34af43904ab8a3b21d7896ef7aba74034936c9a72dcdefd9fa55d521d6017eb2e6bda4e93009ce2f35f85411700d895867649dbcf768fbac8ce2fa675ecd7faa5e0030fc3fc6a9dd3ce747b116d07ad3c7d00fec6e03d5c4b54d90861426a8f0a1c4ce255e0cacc03e55156090e7f3fe0a60cdd9c0ed1b291725222524c2022cd5f62a557419be98017f0dd0247a63fba192160bc0945237b8aba9f8edcc60b53389849e7bee57f641dba2f2ad5f60e4beccb88fc155543bca9a25e30a55cacce9d8c82f4a6b1dbcc883fe03b0be716d1f808b6a66c1369a3864a35979a43ea5be0295c4d82e72dbf057f112f40a7a23f4a9087a2cc1076bbbe40dffa3c1c7f332f';

describe('QuorumEntry', function () {
  this.timeout(10000);
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
    it('Should verify an aggregated member signature with not all members having signed', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getMNListJSON());
      mnList.applyDiff(SMNListFixture.getQuorumHashDiff2());
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
  describe('to buffer version 2', () => {
    it('should be able to generate correct buffer', () => {
      var entry = QuorumEntry(quorumEntryJSONV2);
      var buffer = entry.toBuffer();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHexV2, 'hex'));
    });
  });
  describe('fromBuffer version 2', () => {
    it('should be able to parse data from a buffer', () => {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHexV2, 'hex'));
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(quorumEntryJSONV2);
    });
  });
});
