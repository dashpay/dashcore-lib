'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var bitcore = require('../../index');
var ChainLock = bitcore.ChainLock;
var QuorumEntry = bitcore.QuorumEntry;

describe('ChainLock', function () {
  var object;
  var str;
  var buf;
  var object2;
  var buf2;
  var str2;
  var expectedHash2;
  var expectedRequestId2;
  var object3;
  var str3;
  var quorumEntryJSON;
  var quorum;
  var expectedRequestId3;

  beforeEach(()=>{
    // Output from https://github.com/dashpay/dash/pull/3718 PR's description
    object = {
      "blockHash": "00000105df60caca6a257d8f2f90d422f2d1abf6658555650d5c2c8ecd209e25",
      "height": 382312,
      "signature": "17b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2",
    };
    str = '68d50500259e20cd8e2c5c0d65558565f6abd1f222d4902f8f7d256acaca60df0501000017b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2';
    buf = Buffer.from(str, 'hex');

    // DashJ test vectors : https://github.com/dashevo/dashj/blob/857b198a34b5cd49b7890d7c4dd3bbd2e6d9cc09/core/src/test/java/org/bitcoinj/quorums/ChainLockTest.java
    str2 = 'ea480100f4a5708c82f589e19dfe9e9cd1dbab57f74f27b24f0a3c765ba6e007000000000a43f1c3e5b3e8dbd670bca8d437dc25572f72d8e1e9be673e9ebbb606570307c3e5f5d073f7beb209dd7e0b8f96c751060ab3a7fb69a71d5ccab697b8cfa5a91038a6fecf76b7a827d75d17f01496302942aa5e2c7f4a48246efc8d3941bf6c';
    object2 = {
      height: 84202,
      blockHash: '0000000007e0a65b763c0a4fb2274ff757abdbd19c9efe9de189f5828c70a5f4',
      signature: '0a43f1c3e5b3e8dbd670bca8d437dc25572f72d8e1e9be673e9ebbb606570307c3e5f5d073f7beb209dd7e0b8f96c751060ab3a7fb69a71d5ccab697b8cfa5a91038a6fecf76b7a827d75d17f01496302942aa5e2c7f4a48246efc8d3941bf6c'
    }
    buf2 = Buffer.from(str2, 'hex');
    expectedHash2 = "3764ada6c32f09bb4f02295415b230657720f8be17d6fe046f0f8bf3db72b8e0";
    expectedRequestId2 = "6639d0da4a746f7260968e54be1b14fce8c5429f51bfe8762b58aae294e0925d";

    // DashSync test vectors : https://github.com/dashevo/dashsync-iOS/blob/master/Example/Tests/DSChainLockTests.m
    object3 = {
      height: 1177907,
      blockHash: Buffer.from('0000000000000027b4f24c02e3e81e41e2ec4db8f1c42ee1f3923340a22680ee', 'hex'),
      signature: Buffer.from('8ee1ecc07ee989230b68ccabaa95ef4c6435e642a61114595eb208cb8bfad5c8731d008c96e62519cb60a642c4999c880c4b92a73a99f6ff667b0961eb4b74fc1881c517cf807c8c4aed2c6f3010bb33b255ae75b7593c625e958f34bf8c02be', 'hex')
    }
    str3 = '33f911000000000000000027b4f24c02e3e81e41e2ec4db8f1c42ee1f3923340a22680ee8ee1ecc07ee989230b68ccabaa95ef4c6435e642a61114595eb208cb8bfad5c8731d008c96e62519cb60a642c4999c880c4b92a73a99f6ff667b0961eb4b74fc1881c517cf807c8c4aed2c6f3010bb33b255ae75b7593c625e958f34bf8c02be';

    quorumEntryJSON = {
      "version": 1,
      "llmqType": 2,
      "quorumHash": "0000000007697fd69a799bfa26576a177e817bc0e45b9fcfbf48b362b05aeff2",
      "signersCount": 400,
      "signers": "bf7fffaffedffef77fef7ffffffcbdffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f0000000000",
      "validMembersCount": 400,
      "validMembers": "bf7fffaffedffef77fef7ffffffcbfffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f0000000000",
      "quorumPublicKey": "03a3fbbe99d80a9be8fc59fd4fe43dfbeba9119b688e97493664716cdf15ae47fad70fea7cb93f20fba10d689f9e3c02",
      "quorumVvecHash": "bede6b120304eb31d173678bb54ffcb0ab91f8d72d5af78b5047f76e393a26a2",
      "quorumSig": "9944c544e03a478b401b65cabbb24338872613f7d58ff13ab038ab86418ec70ef1734ff43e965ccb83e02da83b10d44c0f23c630752cfb29b402149a1fc3fad0760e6341a4a1031efad2983c8637d2a461e9bcaf935b7a4dfa225ed2f7771c75",
      "membersSig": "92eda5c13583577719bea9337b4b9b6286ac11a072de0955b0dc5a012280bb557a53f9643cee7730dabe2d3a4a19042813ef5d39ae92d0015554954011c1e12bc688d4d7672ac33c4001e0dedbfe5d0316f2ad23206d478964ca62d75f50e4d0"
    };

    quorum = new QuorumEntry(quorumEntryJSON);

    expectedRequestId3 = "f79d7cee1eea5839d91da7921920f19258e08b51c7cda01086e52d1b1d86510c";

  })


  it('should have clsig a constant', function () {
    expect(ChainLock.CLSIG_REQUESTID_PREFIX).to.deep.equal('clsig');
  });
  describe('instantiation', function () {
    describe('fromBuffer', function () {
      it('should be able to parse data from a buffer', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        var chainLockStr = chainLock.toString();
        expect(chainLockStr).to.be.deep.equal(str2)
        var chainLockJSON = chainLock.toObject();
        expect(chainLockJSON).to.be.deep.equal(object2)
      });
    });

    describe('fromObject', function () {
      it('Should be able to parse data from an object', function () {
        var chainLock = ChainLock.fromObject(object2);
        var chainLockStr = chainLock.toString();
        expect(chainLockStr).to.be.deep.equal(str2)
      });
    });

    describe('fromString', function () {
      it('Should be able to parse data from a hex string', function () {
        var chainLock = ChainLock.fromHex(str2);
        var chainLockJSON = chainLock.toObject();
        var chainLockBuffer = chainLock.toBuffer().toString('hex');
        expect(chainLockJSON).to.be.deep.equal(object2)

        expect(chainLockBuffer).to.be.deep.equal(buf2.toString('hex'))
      });
    });

    describe('clone itself', function () {
      it('can be instantiated from another chainlock', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        var chainLock2 = new ChainLock(chainLock);
        chainLock2.toString().should.equal(chainLock.toString());
      });
    })
  });

  describe('validation', function () {
    describe('#verifySignatureAgainstQuorum', function () {
      it('should verify signature', async function () {
        var chainLock = new ChainLock(buf2);
        var isValid = await chainLock.verifySignatureAgainstQuorum(quorum);
        expect(isValid).to.equal(false);

        //FIXME: Neither DashJ nor DashSync or even dashd have any test vectors of successful verification
        // from chainlock hex and quorum. We don't yet have ability to unit test successful verify.
        // TODO: expect().to.equal(true).
      });
    })
  });

  describe('computation', function () {
    describe('#getHash', function () {
      it('should compute the hash', function () {
        var hash = ChainLock.fromBuffer(buf2).getHash().toString('hex');
        expect(hash).to.deep.equal(expectedHash2);
      })
    })
    describe('#getRequestId', function () {
      it('should compute the requestId', function () {
        var chainLock2 = new ChainLock(object2);
        var requestId2 = chainLock2.getRequestId().toString('hex');
        expect(requestId2).to.deep.equal(expectedRequestId2);

        var chainLock3 = new ChainLock(str3);
        var requestId3 = chainLock3.getRequestId().toString('hex');
        expect(requestId3).to.deep.equal(expectedRequestId3)
      })
    })
  })

  describe('output', function () {
    describe('#copy', function () {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(Buffer.from(str2, 'hex'));
        var chainLockCopy = chainLock.copy();
        expect(chainLockCopy).to.deep.equal(chainLock);
      })
    });
    describe('#toBuffer', function () {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        expect(chainLock.toBuffer().toString('hex')).to.deep.equal(str2);
      })
    });
    describe('#toJSON/#toObject', function () {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf);
        expect(chainLock.toObject()).to.deep.equal(chainLock.toJSON());
        expect(chainLock.toObject()).to.deep.equal(object);

        var chainLock2 = ChainLock.fromBuffer(buf2);
        expect(chainLock2.toObject()).to.deep.equal(chainLock2.toJSON());
        expect(chainLock2.toObject()).to.deep.equal(object2);
      })
    });
    describe('#toString', function () {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        expect(chainLock.toString()).to.deep.equal(str2);
      })
    });
    describe('#inspect', function () {
      it('should output formatted output correctly', function () {
        var chainLock = new ChainLock(str);
        var output = '<ChainLock: 00000105df60caca6a257d8f2f90d422f2d1abf6658555650d5c2c8ecd209e25, height: 382312>';
        chainLock.inspect().should.equal(output);
      });
    });
  })
});
