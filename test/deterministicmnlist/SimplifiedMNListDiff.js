/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var SimplifiedMNListDiff = require('../../lib/deterministicmnlist/SimplifiedMNListDiff');
var expect = require('chai').expect;
var sinon = require('sinon');
var Networks = require('../../lib/networks');

var mnListDiffHexString = 'd6c47184a6d7a08b9360a84c377e2320a7ec969a2fc7f80a7ef9b305000000007abac1d3fa5c8957bff0e9e1880c9d59ffefcc1b04b9b364c14f1604000000000100000001720668fc7eb874724c9fb50479009b8747d64f7c36bccb8f7b3fe247f346d6ce010103000500010000000000000000000000000000000000000000000000000000000000000000ffffffff4b02bb520427f3355c08fabe6d6d01ac1912a0a88021110ad2364eade497dd1da0edd7857757c10f62dd720956ac0100000000000000100000175a0000000d2f6e6f64655374726174756d2f000000000200e12237010000001976a914cb594917ad4e5849688ec63f29a0f7f3badb5da688ac00e12237010000001976a914a3c5284d3cd896815ac815f2dd76a3a71cb3d8e688ac00000000260100bb5200009e8ecb69a1493e3d573cc9ce8460b9a0d7b05e77ca17878c9faf73959392cef3019f5c63c41c148ef09e4c82471db0500b6c2246d77a93c0387330201e6124d91404419aa9fed4f35fcb986c50fbaa0c7555c68f8a9876968c63c6f92064ff06f1fe7b34629e1f9f156e4e3720ed76745a9966adb50fb513f1285263d5050000000000000000000000000000ffff2d30b1de4e1f842476e8d82327adfb9b617a7ac3f62868946c0c4b6b0e365747cfb8825b8b79ba0eb1fa62e8583ae7102f59bf70c7c7ce2342a602ce6bd150809591377ecf31971558ca01685ce50d7f351dae246ab6d23033b1fb7ad8368467fb348086822fe6ce77d8a4398f99dae01aee02f174c49075e3e92422227fd6a57d4a44d7419c060000000000000000000000000000ffff5350e5d54e1f16415af54406658be9ea44d82b6b502bb90d93e32997484533a8a71a4ed98d12cea3709d84a5835b6ad8ed48d3101633d0669e929f06ac80c05365d9558ad79cbb78f2c000f1b186e58c0e1247221f1ce97cd273f917e034ff4b66baee366ede691e0590a66348fc52b6a63a7013cde16f282347e5949d88a8f9989a46411409190000000000000000000000000000ffff95f8374d4e1f8b165f653a3970a17f432f6c3abb8b681c71a3775f998fff322341d2994767c167c8a43b1b4661b9c01ef637763d4d814d31414b558eff2b3b489b6128ac6852e0fdb85c009f90d73441206a915ec0e889bba5d0d1e3fddf9ccb5ef37f51ede61ea0c1466afa7a17bc1dadb4a69815103b85f849eb9dc0db670bd01c7c033529090000000000000000000000000000ffff332670634e1f88ee437bc0ba444b71a6b8a525146e9c748a8430fc85ad47beda04bb2e5b698bca9f3d5a5d5dfdd5990cd08daa07371f8cbb11679781ce75b0f15db8eae0464672c34ae401';

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
      "votingAddress": "yf7QHemCfbmKEncwZxroTj8JtShXsC28V6",
      "isValid": true
    },
    {
      "proRegTxHash": "a4d877cee62f82868034fb678436d87afbb13330d2b66a24ae1d357f0de55c68",
      "confirmedHash": "00000000069c41d7444a7da5d67f222224e9e37590c474f102ee1ae0da998f39",
      "service": "83.80.229.213:19999",
      "pubKeyOperator": "16415af54406658be9ea44d82b6b502bb90d93e32997484533a8a71a4ed98d12cea3709d84a5835b6ad8ed48d3101633",
      "votingAddress": "yfKNLE5v4QTnMvj7y3JVoWEfQanD4qHWGk",
      "isValid": false
    },
    {
      "proRegTxHash": "a690051e69de6e36eeba664bff34e017f973d27ce91c1f2247120e8ce586b1f1",
      "confirmedHash": "0000000019091441469a98f9a8889d94e54723286fe1cd13703aa6b652fc4863",
      "service": "149.248.55.77:19999",
      "pubKeyOperator": "8b165f653a3970a17f432f6c3abb8b681c71a3775f998fff322341d2994767c167c8a43b1b4661b9c01ef637763d4d81",
      "votingAddress": "yTMbtGvG722zFbkpAnBrQvJ8WXH2g2kosL",
      "isValid": false
    },
    {
      "proRegTxHash": "6a46c1a01ee6ed517ff35ecb9cdffde3d1d0a5bb89e8c05e916a204134d7909f",
      "confirmedHash": "00000000092935037c1cd00b67dbc09deb49f8853b101598a6b4ad1dbc177afa",
      "service": "51.38.112.99:19999",
      "pubKeyOperator": "88ee437bc0ba444b71a6b8a525146e9c748a8430fc85ad47beda04bb2e5b698bca9f3d5a5d5dfdd5990cd08daa07371f",
      "votingAddress": "yZ9ZYmfby7fcLpJm9hPosEVmkY6eQ4PXA4",
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
      var buff = Buffer.from(mnListDiffHexString, 'hex');
      var buff2 = Buffer.from(buff);

      var diff = new SimplifiedMNListDiff(buff);

      expect(SimplifiedMNListDiff.fromBuffer.callCount).to.be.equal(1);
      // expect(SimplifiedMNListDiff.fromBuffer.args[0][0]).to.be.deep.equal(Buffer.from(mnListDiffHexString, 'hex'));
      expect(SimplifiedMNListDiff.fromBuffer.calledWithMatch(buff2)).to.be.true;

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
      var smlDiff = new SimplifiedMNListDiff(buf, Networks.testnet);
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
      var diff = SimplifiedMNListDiff.fromHexString(mnListDiffHexString, Networks.testnet);
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
