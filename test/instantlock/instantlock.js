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
  let expectedHash;
  let expectedRequestId;
  let object2;
  let buf2;
  let str2;
  let expectedHash2;
  let expectedRequestId2;
  let quorumEntryJSON;
  let quorum;

  beforeEach(() => {
    // DashJ test vector : https://github.com/dashevo/dashj/blob/master/core/src/test/java/org/bitcoinj/quorums/InstantSendLockTest.java
    str = '011dbbda5861b12d7523f20aa5e0d42f52de3dcd2d5c2fe919ba67b59f050d206e00000000babb35d229d6bf5897a9fc3770755868d9730e022dc04c8a7a7e9df9f1caccbe8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80';
    object = {
      inputs:[
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0
        },
      ],
      txid: 'becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba',
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80'
    };
    buf = Buffer.from(str, 'hex');
    expectedHash = "4001b2c5acff9fc94e60d5adda9f70c3f0f829d0cc08434844c31b0410dfaca0";
    expectedRequestId = "bbbb1cfeb55396d7e5f9bebdb220670d23dbb0b47e22b1cd5357afe1ef33f559";

    str2 = '01825991eb118aa41e71ced9077dd48fa66b8765c7e7198c4671bfa8f757ef38bb01000000cadb623d3a686e994c33d9f77be75e1662213ce1eda72f4034d6c0d0f14ce603137c0c27601a7d276f0141c55a11a84b34a022688399fab8e1f33dfa758007ddae002bfc29ce9e1bcf05bce139fa68b501ab691053ddd8a22d70de692f0ab06aca57f77a2844ce9f0ad79d74727dca896236019ac4bb2722ab80ce7f9e69bc9d';
    object2 = {
      inputs:[
        {
          outpointHash: 'bb38ef57f7a8bf71468c19e7c765876ba68fd47d07d9ce711ea48a11eb915982',
          outpointIndex: 1
        },
      ],
      txid: '03e64cf1d0c0d634402fa7ede13c2162165ee77bf7d9334c996e683a3d62dbca',
      signature: '137c0c27601a7d276f0141c55a11a84b34a022688399fab8e1f33dfa758007ddae002bfc29ce9e1bcf05bce139fa68b501ab691053ddd8a22d70de692f0ab06aca57f77a2844ce9f0ad79d74727dca896236019ac4bb2722ab80ce7f9e69bc9d'
    };
    buf2 = Buffer.from(str2, 'hex');
    expectedHash2 = "e01f06c0a9284ae47253d913e1cd6caa92df8bbbf372dd7feef3f15676001c31";
    expectedRequestId2 = "4c778920186645d97f406e2d3c7ea75bd1a6989992123b640b7bd6b8bc6676bc";

    quorumEntryJSON =      {
      "version": 1,
      "llmqType": 1,
      "quorumHash": "000006bbf4e052245518f644dbb3418a8b60497eb95176750c421808029f5f1b",
      "signersCount": 50,
      "signers": "ffffffffffff03",
      "validMembersCount": 50,
      "validMembers": "ffffffffffff03",
      "quorumPublicKey": "82b5f072e8afb58f3b6fdccfb7da330f7b88bfacb36ea5855e5b757fa2a7a500649105f13555f6f57b30051b75d4a40d",
      "quorumVvecHash": "ffdf9794b7c616cbfe7a9c4c2c1b7e6eade7893f1cdba170024057aa4f700b6e",
      "quorumSig": "0de4bee2d8f14ba2b82d038200a04eefa859c628d5860f04f8c8b7e059ea6aeb8e4f20d41b8d92313e7ca147ed6b41e60ca4dd2acb11e89899a63ba2fff1338232d75b88e955b000807054bcb71e5583178dbcb6fed4ac74474803b2827389bd",
      "membersSig": "90d88ab58e6a244fe92a94fc3093897d144591ea3731d450458d56ff50f2b67585ec0f0529461cf3eba306f4dc3d4ce218e28e3aeb1c1af66a50678b5cb2e918c387c0431bb42d4610488a6452807d2f4146cabd73392e68a6bcf6e9eb02fe2c"
    };

    quorum = new QuorumEntry(quorumEntryJSON);
  });


  it(`should have 'islock' constant prefix`, function () {
    expect(InstantLock.ISLOCK_REQUESTID_PREFIX).to.deep.equal('islock');
  });
  describe('instantiation', function () {
    describe('fromBuffer', function () {
      it('should be able to parse data from a buffer', function () {
        const instantLock = InstantLock.fromBuffer(buf);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str);
        const instantLockJSON = instantLock.toObject();
        expect(instantLockJSON).to.be.deep.equal(object)
      });
      it('should be able to parse data from another buffer', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str2);
        const instantLockJSON = instantLock.toObject();
        expect(instantLockJSON).to.be.deep.equal(object2)
      });
    });

    describe('fromObject', function () {
      it('Should be able to parse data from an object', function () {
        const instantLock = InstantLock.fromObject(object);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str)
      });
      it('Should be able to parse data from another object', function () {
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
        const instantLock = new InstantLock(buf2);
        const isValid = await instantLock.verifySignatureAgainstQuorum(quorum);
        expect(isValid).to.equal(true);
      });
    });
    describe('#verify', function () {
      this.timeout(6000);
      it('should verify signature against SMLStore', async function () {
        const instantLock = new InstantLock(buf2);
        const smlDiffArray = SMNListFixture.getInstantLockDiffArray();
        const SMLStore = new SimplifiedMNListStore(smlDiffArray);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
    });
  });

  describe('computation', function () {
    describe('#getHash', function () {
      it('should compute the hash of an InstantLock', function () {
        const hash = InstantLock.fromBuffer(buf).getHash().toString('hex');
        expect(hash).to.deep.equal(expectedHash);
      });
      it('should compute the hash of another InstantLock', function () {
        const hash = InstantLock.fromBuffer(buf2).getHash().toString('hex');
        expect(hash).to.deep.equal(expectedHash2);
      });
    });
    describe('#getRequestId', function () {
      it('should compute the requestId of an InstantLock', function () {
        const instantLock = new InstantLock(object);
        const requestId = instantLock.getRequestId().toString('hex');
        expect(requestId).to.deep.equal(expectedRequestId);
      });
      it('should compute the requestId of another InstantLock', function () {
        const instantLock2 = new InstantLock(object2);
        const requestId2 = instantLock2.getRequestId().toString('hex');
        expect(requestId2).to.deep.equal(expectedRequestId2);
      });
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
        const instantLock = new InstantLock(str);
        const output = '<InstantLock: becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba, sig: 8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80>';
        instantLock.inspect().should.equal(output);
      });
    });
  })
});
