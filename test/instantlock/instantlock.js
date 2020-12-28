'use strict';

const chai = require('chai');
const expect = chai.expect;

const bitcore = require('../../index');
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const SMNListFixture = require('../fixtures/mnList');
const InstantLock = bitcore.InstantLock;
const QuorumEntry = bitcore.QuorumEntry;

const getSMLStoreJSONFixture = require('../fixtures/getSMLStoreJSON');

describe('InstantLock', function () {
  this.timeout(10000);
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
  let instantLockJSONFromTestNet;

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

    quorumEntryJSON = {
      "version": 1,
      "llmqType": 1,
      "quorumHash": "00000aa2ebb79791febf877853f421a19b6b843f965a17527acb01fa18a84d8b",
      "signersCount": 50,
      "signers": "ffffffffffff03",
      "validMembersCount": 50,
      "validMembers": "ffffffffffff03",
      "quorumPublicKey": "17b9dc6759fd4ddd55241b17b3a1c9af43814d3dfb4fb5c42b049cce8b3c779703869c396cf43a3cd1c0de3afacb3ab3",
      "quorumVvecHash": "f10cb68a98f619e30db2d41f1de4ee4f5ab651a7c5cdd28434836c46430d63ad",
      "quorumSig": "0fa9672a76ba16df03da741bf51874d1d0b618bef00288a5bf9672f8daab1e98f5f9ff7579097b2dca63e6b0885f6983179a0cd2c0d4f673e94cbd912944331ac63d3dcc635a4d00f803a7cafb41b41e9c9723e809111f4cc96cb68b1789a774",
      "membersSig": "8f9b86c65295601145ff5d7ef1828c15df04a7f930026508e89283016f4cf7d16f26f83d673855828211ea0bda7bba170a25e7148711a4f33551ec2869aa7270335dc50b67b1e792554c7f96d249b7f14064e9550e0481fd969b320c918ff995"
    };

    instantLockJSONFromTestNet = {
      inputs: [
        {
          outpointHash: 'be880dbaba634974d82b5c333e4c46f3168332faff2d7eca563d96ec2ff3284b',
          outpointIndex: 0
        }
      ],
      txid: '822943269a2dfa7b2c081853787e06330936f54b88c2474a87a9abd0bea1d884',
      signature: '05a6c477b76b23ed40c061a935273c0a9b72ad50814664dbe821ca35609be0742acd0c4409d9e898f388a113f1fc66160ed17cb2f8f1ed5747046f400b8e66426f6e1e734aa7cb88c036d46382ffb60ce92f080d7e27a43a80424ebfb4d17f3c'
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
        expect(instantLock2.toString()).to.be.equal(instantLock.toString());
      });
    })
  });

  describe('validation', function () {
    describe('#verifySignatureAgainstQuorum', function () {
      it('should verify signature against single quorum', async function () {
        const instantLock = new InstantLock(buf2);
        const requestId = instantLock.getRequestId();
        const isValid = await instantLock.verifySignatureAgainstQuorum(quorum, requestId);
        expect(isValid).to.equal(true);
      });
    });
    describe('#verify', function () {
      it('should verify signature against SMLStore', async function () {
        const instantLock = new InstantLock(buf2);
        const smlDiffArray = SMNListFixture.getInstantLockDiffArray();
        const SMLStore = new SimplifiedMNListStore(smlDiffArray);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
      it('should not crash if BLS fails to parse the signature or any other data', async function () {
        const instantLock = new InstantLock(buf2);
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const smlDiffArray = SMNListFixture.getInstantLockDiffArray();
        const SMLStore = new SimplifiedMNListStore(smlDiffArray);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(false);
      });
      it('should verify instant lock past the height in sml store', async function () {
        const SMLStore = SimplifiedMNListStore.fromJSON(getSMLStoreJSONFixture())

        // That's is an ISLock approximately from height 4846
        const instantLock = InstantLock.fromObject(instantLockJSONFromTestNet);

        // It verifies for the store 4765-4853
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
      it('should not crash if no quorum was found for the lock to verify', async function () {
        const SMLStore = SimplifiedMNListStore.fromJSON(getSMLStoreJSONFixture())

        // Proceeding with the test
        const instantLock = new InstantLock(buf2);
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(false);
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
        expect(instantLock.inspect()).to.be.equal(output);
      });
    });
  })
});
