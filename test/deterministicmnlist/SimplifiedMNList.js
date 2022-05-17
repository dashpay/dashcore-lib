/* eslint-disable */
var expect = require('chai').expect;
var sinon = require('sinon');
var SMNListFixture = require('../fixtures/mnList');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');
var QuorumEntry = require('../../lib/deterministicmnlist/QuorumEntry');
var constants = require('../../lib/constants');
var Networks = require('../../lib/networks');
const testnetDiffs = require('../fixtures/testnetSMLDiffs.json');

describe('SimplifiedMNList', function () {
  this.timeout(15000);

  describe('constructor', function () {
    it('Should call applyDiff with the first argument passed to the constructor', function () {
      var spy = sinon.spy(SimplifiedMNList.prototype, 'applyDiff');

      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());

      expect(mnList.applyDiff.callCount).to.be.equal(1);
      expect(mnList.applyDiff.calledWithExactly(SMNListFixture.getFirstDiff()))
        .to.be.true;
      spy.restore();
    });
    it("Should not call applyDiff if the first argument isn't passed", function () {
      var spy = sinon.spy(SimplifiedMNList.prototype, 'applyDiff');

      var mnList = new SimplifiedMNList();

      expect(mnList.applyDiff.callCount).to.be.equal(0);
      spy.restore();
    });
  });
  describe('applyDiff', function () {
    it('Should apply diff and sort MN entries', function () {
      var mnList = new SimplifiedMNList();
      var diff = SMNListFixture.getFirstDiff();

      mnList.applyDiff(diff);
      expect(mnList.mnList.length).to.be.equal(diff.mnList.length);
      // Since mn list is sorted and diff isn't, we need to check the list that way
      mnList.mnList.forEach(function (entry) {
        var diffIndex = diff.mnList.findIndex(function (diffEntry) {
          return diffEntry.proRegTxHash === entry.proRegTxHash;
        });
        // toObject since diff is just JSON, while entry in the list is an instance of SimplifiedMNListEntry
        expect(entry.toObject()).to.be.deep.equal(diff.mnList[diffIndex]);
      });
      expect(mnList.calculateMerkleRoot()).to.be.equal(diff.merkleRootMNList);
    });
    it('Should update entries', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var mnsCountInTheFirstDiff = SMNListFixture.getFirstDiff().mnList.length;
      var mnsCountInTheSecondDiff =
        SMNListFixture.getSecondDiff().mnList.length;
      var mnsDeleted = SMNListFixture.getSecondDiff().deletedMNs.length;

      mnList.applyDiff(SMNListFixture.getSecondDiff());

      // Check that there are masternodes to be deleted
      expect(mnsDeleted).to.be.equal(76);
      // Check that there are masternodes to be updated - resulting list should be shorter than two diff - deleted count
      expect(
        mnsCountInTheFirstDiff + mnsCountInTheSecondDiff - mnsDeleted
      ).to.be.above(mnList.mnList.length);
      expect(mnList.mnList.length).to.be.equal(
        SMNListFixture.getFirstTwoDiffsCombined().mnList.length
      );
      // Check that calculated merkle root is the same as merkle root in the latest applied diff
      expect(mnList.calculateMerkleRoot()).to.be.equal(
        SMNListFixture.getSecondDiff().merkleRootMNList
      );
    });
    it('Should throw an error if diffs are nonconsecutive', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      expect(function () {
        mnList.applyDiff(SMNListFixture.getThirdDiff());
      }).to.throw(
        "Cannot apply diff: previous blockHash needs to equal the new diff's baseBlockHash"
      );
    });
    it("Should throw an error if calculated merkle root doesn't match merkle root in the diff", function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      expect(function () {
        mnList.applyDiff(SMNListFixture.getSecondDiffWithWrongRoot());
      }).to.throw(
        "Merkle root from the diff doesn't match calculated merkle root after diff is applied"
      );
    });
    it("Should set base block hash on the first call and don't change it on any further calls", function () {
      var mnList = new SimplifiedMNList();
      expect(mnList.baseBlockHash).to.be.equal(constants.NULL_HASH);

      mnList.applyDiff(SMNListFixture.getFirstDiff());
      expect(mnList.baseBlockHash).to.be.equal(
        SMNListFixture.getFirstDiff().baseBlockHash
      );

      mnList.applyDiff(SMNListFixture.getSecondDiff());
      // Should be equal to the block hash from the first diff
      expect(mnList.baseBlockHash).to.be.equal(
        SMNListFixture.getFirstDiff().baseBlockHash
      );
    });
    it('should process the diffs from testnet', function () {
      const mnList = new SimplifiedMNList();

      mnList.applyDiff(testnetDiffs[0]);

      expect(mnList.quorumList.length).to.be.equal(39);

      testnetDiffs.shift();

      testnetDiffs.forEach((diff) => {
        mnList.applyDiff(diff);
      });
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
    it('Should return a zero hash if the list is empty', function () {
      var mnList = new SimplifiedMNList();

      var root = mnList.calculateMerkleRoot();
      expect(root).to.be.equal(
        '0000000000000000000000000000000000000000000000000000000000000000'
      );
    });
  });

  describe('#calculateMerkleRootQuorums', () => {
    it('should calculate correct merkle root', () => {
      const a = new QuorumEntry(
        {
          "version":1,
          "llmqType":100,
          "quorumHash":"753764c9fb6843b1533fad9f174415341f05d00567d58eb470d17264d9baa545",
          "quorumIndex":0,
          "signersCount":3,
          "signers":"07",
          "validMembersCount":3,
          "validMembers":"07",
          "quorumPublicKey":"10fda18d54b6951d95bb5ed0a3a8e394eb68fab071222e73578b98efbfeb4de175bf169144a8b018314e7b211bd3fb15",
          "quorumVvecHash":"887542af974137fc0b41ce69750cbbda98b47d31b33092171395dec4abdfc984",
          "quorumSig":"858820e9386a51f819c19557f0f0bd057425d53b260580262d475778f05427a9546c8896af806f7aaeafaa765290dc610ad3aa440df3075209f8a31229f9f762ddf6df2d0cd8d5c8775942f5e870cb6a839df2f13829307d4d9525cc61f406b9",
          "membersSig":"07a245a7d3fbcea80491c085e2282b5f0962ee753cd18057158236728412a61b4c502465de6de9cdfc180813d4ddcfe019fc1585b9c3163f26869e7e9f370170d205425e0532dcb741e7b7b0ee9e22dd372cd4bd00e2da22ed0700ab6aa2c05e"
        });

      expect(a.calculateHash().toString('hex'))
        .to.equals('23350208e4aba648d02e1fcb62e6c581b81f347371214f74ec774d21aeae27e9');

      const b = new QuorumEntry({
        "version":1,
        "llmqType":102,
        "quorumHash":"753764c9fb6843b1533fad9f174415341f05d00567d58eb470d17264d9baa545",
        "quorumIndex":0,
        "signersCount":3,
        "signers":"07",
        "validMembersCount":3,
        "validMembers":"07",
        "quorumPublicKey":"84cf006c77d375083402f0e0c18f9e5ca43885e8c5878fbdf7e43fdb8cb16793342791d427b6a176fb53d63056ec464a",
        "quorumVvecHash":"4a8a23f24ffd59d555d598406d94481f7483da1dcb617f7527141e51fff6ad08",
        "quorumSig":"9997c5f302cdf437d72ba1f1398f7c1b4ca2746b41f21235ff78652de9d4951b8000ec8495efa965e79710a7a793e6a0159c3be54415c23292860adb7aac2116aa1709d1917df22f38be2d5651c1150bc1edb66496211286eef63ab3d4ebef0e",
        "membersSig":"153ff3e9e33d5d95618636c5c1bcc49179a54bd272efa20b4ca7ff9c2422e0f2a623d7c0b84bdaf35476dd7d15be2b2a0d649f9821ca530f4a22cd1e4a4fdadc5c9b40ba9bd83c5732fd5b3fceb28cb7e7961769c16b538526f9450efa213331"
      });

      expect(b.calculateHash().toString('hex')).
      to.equals('542a71b1252d42ac424757fde6674cbeeda3ff713d82b6f6196cec96a6f1a676');

      const c = new QuorumEntry({
        "version":2,
        "llmqType":103,
        "quorumHash":"753764c9fb6843b1533fad9f174415341f05d00567d58eb470d17264d9baa545",
        "quorumIndex":0,
        "signersCount":4,
        "signers":"0f",
        "validMembersCount":4,
        "validMembers":"0f",
        "quorumPublicKey":"83e7a1e7a1392d45909e53f12d90324c2d561f5c36d4d71fdc36ace7aab309c26a46e7c5cca571d76ec3ba84cebe80b4",
        "quorumVvecHash":"af5b393c6d0307c999ba07efed33f3c439cc9a942d7c00220bfa9428d496d0ca",
        "quorumSig":"0e8f8da8d4d013a5a05d8f4db6fc1d713c64b3ede35ee9a9bfaecd00198453ebef44cebc4600eef354c7dbd56e4afa541875560efa9dee5fae3a61c0f20dc5a8501e3baf4b1d3b2c56e635fe5f1d15a770e54f4bea9c548be40dc9767a8efe4a",
        "membersSig":"951d2c68f5772ec1f3be657d2388dc2755fd31c6b8e6cdb50e35f6b918dab16e8c521ba08408c98eb48f279bc5f303fe17ddf479a28681e9f6ba97e4ee5789d4d5fd5c1d1d39c081d1e6cc446720f920f21afc952f9ef478f2d90bd61b6fe118"
      });

      expect(c.calculateHash().toString('hex')).
      to.equals('761e0a139dd1b516d00e880c0779947aa3e81e970e58bf21c8cf582b3d60cdab');

      const d = new QuorumEntry({
        "version":2,
        "llmqType":103,
        "quorumHash":"3cf85c30b5fd9c8175460aebc1db57a3b575421c79000ab8d5d8b1e9d19dd8de",
        "quorumIndex":1,
        "signersCount":4,
        "signers":"0f",
        "validMembersCount":4,
        "validMembers":"0f",
        "quorumPublicKey":"89f2a917eb187bf5abd8e34941ca4cfde325c511404f58885b46c6fe547337859ca24ac26f8fa71a2a572b23990c21bd",
        "quorumVvecHash":"eebbb2e715d770125441fbe44d43aab51da703016023fc4e6242122d20d12426",
        "quorumSig":"91533cc7cedc920e570e097d886a5a20eae94fd53e4609b8c851ce28fd20404150d04f821382b6ccac2e950a1da3162f1815c8d1c7d36fc6343ccd8708aa9f2a4f65e4e2b85b0ec959447dad6b3ec1ba3da691b4e1f07b93d6aa27f065bac8b5",
        "membersSig":"09798d17fa28c6c7396a5f1b94ac39e087921f71e04d8f5c4be08bcc818352993bc803b0a3a82b7d93c580609a2881f90369f589bda164c1dbe25ded81e6940b3330a27fe0babea5e563f0ac2a5f4fc4772df695a4011b87b320db59e9686b8e"
      });

      expect(d.calculateHash().toString('hex')).
      to.equals('cd1da276eef9d76ed926932b89cf584c0e807fab50ffb31080b6c214ec2c6036');

      const e = new QuorumEntry({
        "version":1,
        "llmqType":100,
        "quorumHash":"2abceb6f8b3848789362da70b46ab9ea96e56202dedd673533623cc7c43c79db",
        "quorumIndex":0,
        "signersCount":3,
        "signers":"07",
        "validMembersCount":3,
        "validMembers":"07",
        "quorumPublicKey":"88d39a648d0f45300c9cff22bf990202710620b04a621ee4bdee3d6dd7c9faedde9d37d0f5d75e1625a2c72aa76b691f",
        "quorumVvecHash":"4b744dd205f212e5b9df8a8c98345501e4bc0f6ed3c6c1722044b51b805eeb5f",
        "quorumSig":"0274638292a2274a4c83c809f09ce107de20e66afd4aed3d4f285fe0834a4bf6302dd5f07ff92707d2b48a9ad2ccb91701f155cdd13b362eceeaf600b2a0de634b9b2c93feae7b10db72ea188ca67de1541de30b0e363c5ed05e8e67049ac822",
        "membersSig":"1385f8f688fed1436392add78d3efc630f541c1b70f4b069c2136161347774465d8db8f47f1be73e7b660b00f85ae1410fa63d691923d5a240fc730f567f84707449ab6edd1c5c33bc6f0d807aacf6eb27ef3d3bd42609790db1cc9305c7baa7"
      });

      expect(e.calculateHash().toString('hex')).
      to.equals('c1150593cebc12c396b1cb130926a5e42a89ba0e64405fb9e28132ce02e43e82');

      const f = new QuorumEntry({
        "version":1,
        "llmqType":102,
        "quorumHash":"2abceb6f8b3848789362da70b46ab9ea96e56202dedd673533623cc7c43c79db",
        "quorumIndex":0,
        "signersCount":3,
        "signers":"07",
        "validMembersCount":3,
        "validMembers":"07",
        "quorumPublicKey":"0cace77871b3f6e7bdaf909dfbd350a8910fde13350785fd110a050af303fa3f3ab6ef111c73cd490ade534bc7590524",
        "quorumVvecHash":"b67614987cffa0201990e095b2fc6c6351cb7535f3cc5906c7459c94feab1af2",
        "quorumSig":"91ea8d9125e89fbf49afb412fc1fb5b7c1c844f4c7157820f9817da3ce5689dfba67a67aa4830b22f91e0489cf40dc58172dde5788507889e71aa7dd3014e9d858d9b0b226a96fd756ff8e8c675626c2245687114962ee2a102ce97a34e9f715",
        "membersSig":"8ca216d27dc62edee4a909603d426e2779bd758347e6afaee8f1b45f479013dc64c38118a5a771fab05813962a349147189c0c2880b6a38785ebe1d7004ccd4f6b5f74e7e39836515019a4377cd28016ec47feab6fcf366172553479c0e21108"
      });

      expect(f.calculateHash().toString('hex')).
      to.equals('93fe389f39ccc23490a3a60e3e35382991818689ad0f5cb0159f4b0c600e7bd5');

      const g = new QuorumEntry({
        "version":2,
        "llmqType":103,
        "quorumHash":"2abceb6f8b3848789362da70b46ab9ea96e56202dedd673533623cc7c43c79db",
        "quorumIndex":0,
        "signersCount":4,
        "signers":"0f",
        "validMembersCount":4,
        "validMembers":"0f",
        "quorumPublicKey":"82c91daa836e3bba53796df4fe9e16e717d4d7d571ef96a38307a19cf63f0222031b116ccbb0c4c367bf971e7855a138",
        "quorumVvecHash":"b1661364baa68d9adbe2248b026ca3a95e5be738960367d38dbfb6ec124d6d48",
        "quorumSig":"95b4ae8182accbc88d280231c615d663ff78b8cb0771b7eea12126f3aacfe597b6ba2bf6579f89dd4ea1136c628c0a2a12a973aac64360586e2500f3a73eb630c5613fbd0cead2f47e0692d5a11d57b4e181b0c006c5f2f1b0c7d0aff33ecf7b",
        "membersSig":"8c93ab82e3dc94a1204b651c5ecee5640d03c117e7fdb516a819804e2ae996ad5c6dd413be27f000ee7f719157e65c0e18daa81919859711b18f524bc9993cc8e4f124a2fadfe1a8c1f57b5586f90a90853e5e07b4f5002ac4a9e5c438d8f7d1"
      });

      expect(g.calculateHash().toString('hex')).
      to.equals('4d9fb3b6978f4bb786f93d179124404b07786012464db955d0c700cb6c2428d6');

      const h = new QuorumEntry({
        "version":2,
        "llmqType":103,
        "quorumHash":"30e73f8500d030a2d9fbfd54f2b63198c85f38f183268c0fce5a5772e13fabbd",
        "quorumIndex":1,
        "signersCount":4,
        "signers":"0f",
        "validMembersCount":4,
        "validMembers":"0f",
        "quorumPublicKey":"0ef7c6b5ace22d3ced4947e8713a81c0b2ae3cb0c02d1388cc076fe07a13d5c5b02605653375f8707818653e90edaac7",
        "quorumVvecHash":"b063f660d1ea711fe1013c620afdd052ec02d7f0ee776618683063d0a800ab7e",
        "quorumSig":"10f15b80ee90d2b0e8d8d1e6b2c421a66f8e0a9f6fe20524313ff0dd53694d1077e04831a504fa49129cfa57f43b94970905ae73e5562ff5a07195cf9e2792bd28f423685a05ed245ecf25bef12e032168cea191986319ccfbf7da33d4e95b6b",
        "membersSig":"8b61b88a9cccd789398688a138a307a59138aad1e7d1addafd739e0f039d3468e0d52ae1a63cb0496bbfa522c9aebd990fd4d69dbe8755825a3161b2c14854fedeb0b69d1729df5f40c3bad8994a9c19c3c6deea0b3b06e37c19d37d628e7617"
      });

      expect(h.calculateHash().toString('hex')).
      to.equals('f8b6236919cb712f700351643e4935194aee65a32e1996b0e607552e509c2e72');

      const list = new SimplifiedMNList();

      list.quorumList = list.sortQuorums([a, b]);

      expect(list.calculateMerkleRootQuorums()).to.equals('9cf6e2f5d7f4fc3c1368ae07e41fb3fffea5138049ffe45d6427126e7408f8fa');

      list.quorumList = list.sortQuorums([a, b, c, d]);

      expect(list.calculateMerkleRootQuorums()).to.equals('b4f1f416e8a4735e97eb35eb37d58941edf58be3fa8bf4993cc63076c046e04e');

      list.quorumList = list.sortQuorums([a, b, c, d, e, f]);

      expect(list.calculateMerkleRootQuorums()).to.equals('03e3f9fe915fa099111766ee5a511978f6aefd6c15d896b27ae18ec6178cc257');

      list.quorumList = list.sortQuorums([a, b, g, h, e, f]);

      expect(list.calculateMerkleRootQuorums()).to.equals('ed2fe2bcade6634e740892dcf1c11b2bd19f2250bbd905af4911c6e2435292aa');
    })
  });

  describe('getValidMasternodesList', function () {
    it('Should return a valid masternodes list', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());

      var validMNs = mnList.getValidMasternodesList();
      expect(validMNs).to.be.an('Array');
      expect(mnList.mnList.length).to.be.equal(371);
      expect(validMNs.length).to.be.equal(273);
      expect(
        mnList.mnList.filter(function (entry) {
          return !entry.isValid;
        }).length
      ).to.be.equal(98);
      validMNs.forEach(function (mnListEntry) {
        expect(mnListEntry.isValid).to.be.true;
      });
    });
    it('Should return an empty array if mn list is empty', function () {
      var mnList = new SimplifiedMNList();

      expect(mnList.getValidMasternodesList().length).to.be.equal(0);
    });
  });
  describe('toSmplifiedMNListDiff', function () {
    it('Should return a simplified masternode lits diff, from which would be possible to restore the same list', function () {
      var originalMNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      originalMNList.applyDiff(SMNListFixture.getSecondDiff());
      expect(originalMNList.mnList.length).to.be.equal(350);

      var diff = originalMNList.toSimplifiedMNListDiff(Networks.testnet);

      var restoredMNList = new SimplifiedMNList(diff);
      expect(restoredMNList.baseBlockHash).to.be.equal(
        originalMNList.baseBlockHash
      );
      expect(restoredMNList.blockHash).to.be.equal(originalMNList.blockHash);
      // Note that base block hash always should be the same as base block hash of the first diff
      expect(restoredMNList.baseBlockHash).to.be.equal(
        SMNListFixture.getFirstDiff().baseBlockHash
      );
      // And block hash should be the same as block hash of the latest applied diff
      expect(restoredMNList.blockHash).to.be.equal(
        SMNListFixture.getSecondDiff().blockHash
      );
      expect(restoredMNList.mnList).to.be.deep.equal(originalMNList.mnList);
      expect(restoredMNList.merkleRootMNList).to.be.deep.equal(
        originalMNList.merkleRootMNList
      );
      expect(restoredMNList.getValidMasternodesList()).to.be.deep.equal(
        originalMNList.getValidMasternodesList()
      );
      expect(restoredMNList.cbTx.toObject()).to.be.deep.equal(
        originalMNList.cbTx.toObject()
      );
      expect(restoredMNList.cbTxMerkleTree).to.be.deep.equal(
        originalMNList.cbTxMerkleTree
      );
    });
    it('Should throw if no diffs were applied to it', function () {
      var mnList = new SimplifiedMNList();

      expect(function () {
        mnList.toSimplifiedMNListDiff();
      }).to.throw("Can't convert MN list to diff - cbTx is missing");
    });
  });
  describe('Quorums', function () {
    it('Should be able to correctly sort quorums', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var unsortedQuorumList = MNList.quorumList;
      var sortedQuorumList = MNList.sortQuorums(unsortedQuorumList);
      var sortedQuorumListFixture = SMNListFixture.getSortedHashes();
      var reversedSortedHashes = sortedQuorumList.map(function (quorum) {
        return new QuorumEntry(quorum).calculateHash().toString('hex');
      });
      expect(reversedSortedHashes).to.be.deep.equal(sortedQuorumListFixture);
    });
    it('Should get a single quorum', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var quorum = MNList.getQuorum(
        constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
        '0000000007697fd69a799bfa26576a177e817bc0e45b9fcfbf48b362b05aeff2'
      );
      expect(quorum.quorumPublicKey).to.be.equal(
        '03a3fbbe99d80a9be8fc59fd4fe43dfbeba9119b688e97493664716cdf15ae47fad70fea7cb93f20fba10d689f9e3c02'
      );
    });
    it('Should not get a single quorum with wrong llmqType', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var quorum = MNList.getQuorum(
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        '0000000007697fd69a799bfa26576a177e817bc0e45b9fcfbf48b362b05aeff2'
      );
      expect(quorum).to.be.equal(undefined);
    });
    it('Should get all quorums', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var quorums = MNList.getQuorums();
      expect(quorums.length).to.be.equal(25);
    });
    it('Should only get all unverified quorums', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var quorums = MNList.getUnverifiedQuorums();
      expect(quorums.length).to.be.equal(25);
      MNList.applyDiff(SMNListFixture.getSecondDiff());
      MNList.applyDiff(SMNListFixture.getThirdDiff());
      var quorumToVerify = MNList.getQuorum(
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        '0000000000c1c305a88441ce9a27a51fbad94555e50aaf6b61f84866bf56b160'
      );
      // now get the quorum diff to verify it with its corresponding mnList
      var quorumMNList = new SimplifiedMNList(
        SMNListFixture.getFirstTwoDiffsCombined()
      );
      quorumMNList.applyDiff(SMNListFixture.getQuorumHashDiff());
      return quorumToVerify.verify(quorumMNList).then((res) => {
        expect(res).to.be.true;
        quorums = MNList.getUnverifiedQuorums();
        expect(quorums.length).to.be.equal(24);
      });
    });
    it('Should only get all verified quorums', function () {
      var MNList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      var quorums = MNList.getVerifiedQuorums();
      expect(quorums.length).to.be.equal(0);
      MNList.applyDiff(SMNListFixture.getSecondDiff());
      MNList.applyDiff(SMNListFixture.getThirdDiff());
      var quorumToVerify = MNList.getQuorum(
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        '0000000000c1c305a88441ce9a27a51fbad94555e50aaf6b61f84866bf56b160'
      );
      // now get the quorum diff to verify it with its corresponding mnList
      var quorumMNList = new SimplifiedMNList(
        SMNListFixture.getFirstTwoDiffsCombined()
      );
      quorumMNList.applyDiff(SMNListFixture.getQuorumHashDiff());
      return quorumToVerify.verify(quorumMNList).then((res) => {
        expect(res).to.be.true;
        quorums = MNList.getVerifiedQuorums();
        expect(quorums.length).to.be.equal(1);
      });
    });
    it('Should throw an error if we are adding more quorums than maximumActiveQuorumsCount for a particular llmqType permits', function () {
      var mnList = new SimplifiedMNList(SMNListFixture.getFirstDiff());
      expect(function () {
        mnList.applyDiff(SMNListFixture.getDiffThatAddsMoreThanDeletes());
      }).to.throw(
        'Trying to add more quorums to quorum type 2 than its maximumActiveQuorumsCount of 4 permits'
      );
    });
  });
});
