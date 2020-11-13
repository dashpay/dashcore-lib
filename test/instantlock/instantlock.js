'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const bitcore = require('../../index');
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const SMNListFixture = require('../fixtures/mnList');
const InstantLock = bitcore.InstantLock;
const QuorumEntry = bitcore.QuorumEntry;

describe('InstantLock', function () {
  let object;
  let str;
  let buf;
  let object2;
  let buf2;
  let str2;
  let expectedHash2;
  let expectedRequestId2;
  let object3;
  let str3;
  let quorumEntryJSON;
  let quorumEntryJSON4;
  let quorum;
  let quorum4;
  let expectedRequestId3;
  let object4;
  let buf4;
  let str4;
  let expectedHash4;
  let expectedRequestId4;

  beforeEach(() => {
    // Output from https://github.com/dashpay/dash/pull/3718 PR's description
    object = {
      "blockHash": "00000105df60caca6a257d8f2f90d422f2d1abf6658555650d5c2c8ecd209e25",
      "height": 382312,
      "signature": "17b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2",
    };
    str = '68d50500259e20cd8e2c5c0d65558565f6abd1f222d4902f8f7d256acaca60df0501000017b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2';
    buf = Buffer.from(str, 'hex');

    // DashJ test vectors : https://github.com/dashevo/dashj/blob/master/core/src/test/java/org/bitcoinj/quorums/InstantSendLockTest.java
    str2 = '011dbbda5861b12d7523f20aa5e0d42f52de3dcd2d5c2fe919ba67b59f050d206e00000000babb35d229d6bf5897a9fc3770755868d9730e022dc04c8a7a7e9df9f1caccbe8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80';
    object2 = {
      inputs:[
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0
        },
      ],
      txid: 'becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba',
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80'
    };
    buf2 = Buffer.from(str2, 'hex');
    expectedHash2 = "4001b2c5acff9fc94e60d5adda9f70c3f0f829d0cc08434844c31b0410dfaca0";
    expectedRequestId2 = "59f533efe1af5753cdb1227eb4b0db230d6720b2bdbef9e5d79653b5fe1cbbbb";

    // DashSync test vectors : https://github.com/dashevo/dashsync-iOS/blob/master/Example/Tests/DSInstantLockTests.m
  });


  it(`should have 'islock' constant prefix`, function () {
    expect(InstantLock.ISLOCK_REQUESTID_PREFIX).to.deep.equal('islock');
  });
  describe('instantiation', function () {
    describe('fromBuffer', function () {
      it('should be able to parse data from a buffer', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str2);
        const instantLockJSON = instantLock.toObject();
        expect(instantLockJSON).to.be.deep.equal(object2)
      });
    });

    describe('fromObject', function () {
      it('Should be able to parse data from an object', function () {
        const instantLock = InstantLock.fromObject(object2);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str2)
      });
    });

    describe('fromString', function () {
      it('Should be able to parse data from a hex string', function () {
        const instantLock = InstantLock.fromHex(str2);
        const instantLockJSON = instantLock.toObject();
        const instantLockBuffer = instantLock.toBuffer().toString('hex');
        expect(instantLockJSON).to.be.deep.equal(object2);

        expect(instantLockBuffer).to.be.deep.equal(buf2.toString('hex'))
      });
    });

    describe('clone itself', function () {
      it('can be instantiated from another instantlock', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        const instantLock2 = new InstantLock(instantLock);
        instantLock2.toString().should.equal(instantLock.toString());
      });
    })
  });

  describe('validation', function () {
    describe('#verifySignatureAgainstQuorum', function () {
      it('should verify signature against single quorum', async function () {
        const instantLock = new InstantLock(buf4);
        const isValid = await instantLock.verifySignatureAgainstQuorum(quorum4);
        expect(isValid).to.equal(true);
      });
    });
    describe('#verify', function () {
      this.timeout(6000);
      it('should verify signature against SMLStore', async function () {
        const instantLock = new InstantLock(buf4);
        const smlDiffArray = SMNListFixture.getChainlockDiffArray();
        const SMLStore = new SimplifiedMNListStore(smlDiffArray);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
    });
  });

  describe('computation', function () {
    describe('#getHash', function () {
      it('should compute the hash', function () {
        const hash = InstantLock.fromBuffer(buf2).getHash().toString('hex');
        expect(hash).to.deep.equal(expectedHash2);
      })
    });
    describe('#getRequestId', function () {
      it('should compute the requestId', function () {
        const instantLock2 = new InstantLock(object2);
        const requestId2 = instantLock2.getRequestId().toString('hex');
        expect(requestId2).to.deep.equal(expectedRequestId2);

        const instantLock3 = new InstantLock(str3);
        const requestId3 = instantLock3.getRequestId().toString('hex');
        expect(requestId3).to.deep.equal(expectedRequestId3)
      })
    })
  });

  describe('output', function () {
    describe('#copy', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(Buffer.from(str2, 'hex'));
        const instantLockCopy = instantLock.copy();
        expect(instantLockCopy).to.deep.equal(instantLock);
      })
    });
    describe('#toBuffer', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        expect(instantLock.toBuffer().toString('hex')).to.deep.equal(str2);
      })
    });
    describe('#toJSON/#toObject', function () {
      it('should output formatted output correctly', function () {
        const instantLock2 = InstantLock.fromBuffer(buf2);
        expect(instantLock2.toObject()).to.deep.equal(instantLock2.toJSON());
        expect(instantLock2.toObject()).to.deep.equal(object2);
      })
    });
    describe('#toString', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        expect(instantLock.toString()).to.deep.equal(str2);
      })
    });
    describe('#inspect', function () {
      it('should output formatted output correctly', function () {
        const instantLock = new InstantLock(str2);
        const output = '<InstantLock: becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba, sig: 8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80>';
        instantLock.inspect().should.equal(output);
      });
    });
  })
});
