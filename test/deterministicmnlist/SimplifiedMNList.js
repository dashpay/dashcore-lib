/* eslint-disable */
var expect = require('chai').expect;
var sinon = require('sinon');
var mnListFixture = require('../fixtures/mnList');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');

var mnListDiffJSON = {
  "baseBlockHash": "0000000005b3f97e0af8c72f9a96eca720237e374ca860938ba0d7a68471c4d6",
  "blockHash": "0000000004164fc164b3b9041bccefff599d0c88e1e9f0bf57895cfad3c1ba7a",
  "cbTxMerkleTree": "0100000001720668fc7eb874724c9fb50479009b8747d64f7c36bccb8f7b3fe247f346d6ce0101",
  "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff4b02bb520427f3355c08fabe6d6d01ac1912a0a88021110ad2364eade497dd1da0edd7857757c10f62dd720956ac0100000000000000100000175a0000000d2f6e6f64655374726174756d2f000000000200e12237010000001976a914cb594917ad4e5849688ec63f29a0f7f3badb5da688ac00e12237010000001976a914a3c5284d3cd896815ac815f2dd76a3a71cb3d8e688ac00000000260100bb5200009e8ecb69a1493e3d573cc9ce8460b9a0d7b05e77ca17878c9faf73959392cef3",
  "deletedMNs": [
    "14d924611e20307338c0937ad746226c0b50b01d47824c9ef08e141cc4635c9f"
  ],
  "mnList": [
    {
      "proRegTxHash": "fef106ff6420f9c6638c9676988a8fc655750caafb506c98cb5ff3d4fea99a41",
      "confirmedHash": "0000000005d5635228f113b50fb5ad66995a7476ed20374e6e159f1f9e62347b",
      "service": "45.48.177.222:19999",
      "pubKeyOperator": "842476e8d82327adfb9b617a7ac3f62868946c0c4b6b0e365747cfb8825b8b79ba0eb1fa62e8583ae7102f59bf70c7c7",
      "keyIDVoting": "ca58159731cf7e3791958050d16bce02a64223ce",
      "isValid": true
    },
    {
      "proRegTxHash": "a4d877cee62f82868034fb678436d87afbb13330d2b66a24ae1d357f0de55c68",
      "confirmedHash": "00000000069c41d7444a7da5d67f222224e9e37590c474f102ee1ae0da998f39",
      "service": "83.80.229.213:19999",
      "pubKeyOperator": "16415af54406658be9ea44d82b6b502bb90d93e32997484533a8a71a4ed98d12cea3709d84a5835b6ad8ed48d3101633",
      "keyIDVoting": "c0f278bb9cd78a55d96553c080ac069f929e66d0",
      "isValid": false
    },
    {
      "proRegTxHash": "a690051e69de6e36eeba664bff34e017f973d27ce91c1f2247120e8ce586b1f1",
      "confirmedHash": "0000000019091441469a98f9a8889d94e54723286fe1cd13703aa6b652fc4863",
      "service": "149.248.55.77:19999",
      "pubKeyOperator": "8b165f653a3970a17f432f6c3abb8b681c71a3775f998fff322341d2994767c167c8a43b1b4661b9c01ef637763d4d81",
      "keyIDVoting": "5cb8fde05268ac28619b483b2bff8e554b41314d",
      "isValid": false
    },
    {
      "proRegTxHash": "6a46c1a01ee6ed517ff35ecb9cdffde3d1d0a5bb89e8c05e916a204134d7909f",
      "confirmedHash": "00000000092935037c1cd00b67dbc09deb49f8853b101598a6b4ad1dbc177afa",
      "service": "51.38.112.99:19999",
      "pubKeyOperator": "88ee437bc0ba444b71a6b8a525146e9c748a8430fc85ad47beda04bb2e5b698bca9f3d5a5d5dfdd5990cd08daa07371f",
      "keyIDVoting": "e44ac3724646e0eab85df1b075ce81976711bb8c",
      "isValid": true
    }
  ],
  "merkleRootMNList": "f3ce92939573af9f8c8717ca775eb0d7a0b96084cec93c573d3e49a169cb8e9e"
};

describe('SimplifiedMNList', function() {
  describe('applyDiff', function () {
    it('Should apply diff and sort MN entries', function () {
      var mnList = new SimplifiedMNList();

      mnList.applyDiff(mnListDiffJSON);
      expect(mnList.mnList).to.be.deep.equal(mnListDiffJSON.mnList);
    });
  });
  describe('deleteMNs', function () {

  });
  describe('addMNs', function () {

  });
  // describe('sort', function () {
  //   it('Should sort mn list in same deterministic way as dashcore', function () {
  //     var mnListJSON = mnListFixture.getMNListJSON();
  //     var mnList = new SimplifiedMNList();
  //
  //     mnList.applyDiff(mnListJSON);
  //     mnList.sort();
  //     var hashes = mnList.getEntryHashes().map(function (hash) { return hash.toString('hex') });
  //
  //     expect(hashes).to.be.deep.equal(mnListFixture.getSortedProRegTxHashes());
  //   });
  // });
  describe('calculateMerkleRoot', function () {
    it('Should calculate merkle root', function () {
      var mnListJSON = mnListFixture.getMNListJSON();
      var mnList = new SimplifiedMNList();

      mnList.applyDiff(mnListJSON);
      var calculatedRoot = mnList.calculateMerkleRoot();

      expect(calculatedRoot).to.be.equal(mnListJSON.merkleRootMNList);
    });
  });
  describe('verify', function () {

  });
});
