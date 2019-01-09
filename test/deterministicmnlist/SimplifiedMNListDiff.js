/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var SimplifiedMNListDiff = require('../../lib/deterministcmnlist/SimplifiedMNListDiff');
var expect = require('chai').expect;
var sinon = require('sinon');

var mnListDiffHexString = '000001ee5108348a2c59396da29dc5769b2a9bb303d7577aee9cd95136c49b9b0000030f51f12e7069a7aa5f1bc9085ddb3fe368976296fd3b6d73fdaf898cc005000000044488a599e5d61709664c32305befd58bef29e33bc6e718af0233f938557a57a95c8119b7b136d94e477a0d2917d5f7245ff299cc6e31994f6236a8fb34fec88f905efa3e6743c889823f00147d36d12fd12ad401c19089f0affcabd423deef673f3a7f84d7ad33214994b5aecf4c1e192cb65b86750b1377e069073d1eba477a010f03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff0603c494000106ffffffff02c3240e4300000000232102f94276f4ab08cb1662d4be95b21e0439401e881deb19022dea67044b699d8d4aacbd240e43000000001976a91496dc3875f032c9439c4b1e4c3c9ddbd8a9c9594888ac00000000260100c4940000e4882a7c3996b2cf4953f5adcace5295cb8c6a8c9c858c2c2d6279c4f00c1a8b0101040eb32f760490054543356cff463865633439dd073cffa570305eb086f70a0301040eb32f760490054543356cff463865633439dd073cffa570305eb086f70e0000000000000000000000000000000000000000000000000000000000000000000000000000c2ae01fb4084cbc3bc31e7f59b36be228a32040400f7737beb39779971e9bc59632243e13fc5fc9ada93b69bf48c2d4c463296cd5a000000000000000000000000cf9af40d4e1f03d90b1cdc04f1dbe435a4ba51ca2d1ddb53e08c43ce12751c4ba45dcdfe2c16cefd61461e17a54d0175aa128db4cd7679fd88206bd6ef71f57e1b6fe04c2da5515193a6fcd40a47eb0000000000000000000000009f596eb84e1f03d90b1cdc04f1dbe435a4ba51ca2d1ddb53e08c03d90b1cdc04f1dbe435a4ba51ca2d1ddb53e08c01';

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


describe('SimplifiedMNListDiff', function () {
  describe('constructor', function () {
    it('Should call .fromObject method, if an object is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, "fromObject");

      var diff = new SimplifiedMNListDiff(mnListDiffJSON);

      expect(SimplifiedMNListDiff.fromObject.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromObject.calledWith(mnListDiffJSON)).to.be.true;

      SimplifiedMNListDiff.fromObject.restore();
    });
    it('Should call .fromBuffer method, if a buffer is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, "fromBuffer");

      var diff = new SimplifiedMNListDiff(Buffer.from(mnListDiffHexString, 'hex'));

      expect(SimplifiedMNListDiff.fromBuffer.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromBuffer.calledWith(Buffer.from(mnListDiffHexString, 'hex'))).to.be.true;

      SimplifiedMNListDiff.fromBuffer.restore();
    });
    it('Should call .fromHexString method, if a hex string is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, "fromHexString");

      var diff = new SimplifiedMNListDiff(mnListDiffHexString);

      expect(SimplifiedMNListDiff.fromHexString.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromHexString.calledWith(mnListDiffHexString)).to.be.true;

      SimplifiedMNListDiff.fromHexString.restore();
    });
    it('Should call a copy method of passed instance, if instance is passed', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      sinon.spy(instance, 'copy');

      var copy = new SimplifiedMNListDiff(instance);

      expect(instance.copy.callCount).to.be.equal(1);
      copy.baseBlockHash = '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);

      instance.copy.restore();
    });
    it('Should throw an error if argument is not a hex string, buffer or object', function () {
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 2))
        .to.throw('Unrecognized argument passed to SimplifiedMNListDiff constructor');
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 'not a hex string'))
        .to.throw('Unrecognized argument passed to SimplifiedMNListDiff constructor');
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, true))
        .to.throw('Unrecognized argument passed to SimplifiedMNListDiff constructor');
    });
  });
  describe('fromObject', function () {
    it('Should be able to create an instance from object', function () {
      var diff = SimplifiedMNListDiff.fromObject(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('toObject', function () {
    it('Should return an object with serialized diff data', function () {
      var diff = new SimplifiedMNListDiff(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('fromBuffer', function () {
    it('Should be able to parse a buffer', function () {
      var buf = Buffer.from(mnListDiffHexString, 'hex');
      var smlDiff = new SimplifiedMNListDiff(buf);
      var parsed = smlDiff.toObject();
      expect(parsed).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('toBuffer', function () {
    it('Should be able to serialize data', function () {
      var buf = new SimplifiedMNListDiff(mnListDiffJSON).toBuffer();
      expect(buf.toString('hex')).to.be.equal(mnListDiffHexString);
    });
  });
  describe('fromHexString', function () {
    it('Should be able to create an instance from a hex string', function () {
      var diff = SimplifiedMNListDiff.fromHexString(mnListDiffHexString);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('copy', function() {
    it('Should create a detached copy of an instance', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      var copy = new SimplifiedMNListDiff(instance);

      copy.baseBlockHash = '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);
    })
  })
});
