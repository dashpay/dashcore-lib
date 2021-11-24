'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const bitcore = require('../../index');
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const InstantLock = bitcore.InstantLock;
const QuorumEntry = bitcore.QuorumEntry;

const diffArrayFixture = require('../fixtures/diffArray1170_1185.json');
const diffArrayAdditionalFixture = require('../fixtures/diffArray1185-1200.json');
const getSMLStoreJSONFixtureNoQuorums = require('../fixtures/getSMLStoreNoQuorumsJSON');

const DashcoreLib = require('../../index');

describe('InstantLock', function () {
  this.timeout(15000);
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
    DashcoreLib.Networks.enableRegtest();

    str =
      '010101102862a43d122e6675aba4b507ae307af8e1e17febc77907e08b3efa28f41b000000004b446de00a592c67402c0a65649f4ad69f29084b3e9054f5aa6b85a50b497fe136a56617591a6a89237bada6af1f9b46eba47b5d89a8c4e49ff2d0236182307c85e12d70ca7118c5034004f93e45384079f46c6c2928b45cfc5d3ad640e70dfd87a9a3069899adfb3b1622daeeead19809b74354272ccf95290678f55c13728e3c5ee8f8417fcce3dfdca2a7c9c33ec981abdff1ec35a2e4b558c3698f01c1b8';
    object = {
      version: 1,
      inputs: [
        {
          outpointHash: '1bf428fa3e8be00779c7eb7fe1e1f87a30ae07b5a4ab75662e123da462281001',
          outpointIndex: 0
        }
      ],
      txid: 'e17f490ba5856baaf554903e4b08299fd64a9f64650a2c40672c590ae06d444b',
      cyclehash: '7c30826123d0f29fe4c4a8895d7ba4eb469b1fafa6ad7b23896a1a591766a536',
      signature: '85e12d70ca7118c5034004f93e45384079f46c6c2928b45cfc5d3ad640e70dfd87a9a3069899adfb3b1622daeeead19809b74354272ccf95290678f55c13728e3c5ee8f8417fcce3dfdca2a7c9c33ec981abdff1ec35a2e4b558c3698f01c1b8'
    };
    buf = Buffer.from(str, 'hex');
    expectedHash =
      '4ee6a4ed2b6c70efd401c6c91dfaf6c61badd13f80ec07c281bb93d5270fcd58';
    expectedRequestId =
      '495be44677e82895a9396fef02c6e9afc1f01d4aff70622b9f78e0e10d57064c';

    str2 =
      '0101bd19ef43a7f6f798a2ac9c26c32b7bd282e0a204c68a0bb5cc9233954448eb2b0000000038b8db8ee2e5ec4a6573b7906a36ca02754bb349d3d19d592dc2fbe569e877d62e02c76c7e57779afd9942f983afbfe2f1e0dd07cab57a75a776b062dfd0c80d92575702490ce2bf1ea23007ab789ccd0cc9aa042ab03e5817e47d7d216b7cdb10efad36588fcc06140f84010357d02b1110a25ab5fcf8f1e0c2389657abb08da854ee81790a8db5e1df52a77426bd8f64985db23fc35c132b4b9744003e049f';
    object2 = {
      version: 1,
      inputs: [
        {
          outpointHash: '2beb4844953392ccb50b8ac604a2e082d27b2bc3269caca298f7f6a743ef19bd',
          outpointIndex: 0
        }
      ],
      txid: 'd677e869e5fbc22d599dd1d349b34b7502ca366a90b773654aece5e28edbb838',
      cyclehash: '0dc8d0df62b076a7757ab5ca07dde0f1e2bfaf83f94299fd9a77577e6cc7022e',
      signature: '92575702490ce2bf1ea23007ab789ccd0cc9aa042ab03e5817e47d7d216b7cdb10efad36588fcc06140f84010357d02b1110a25ab5fcf8f1e0c2389657abb08da854ee81790a8db5e1df52a77426bd8f64985db23fc35c132b4b9744003e049f'
    };
    buf2 = Buffer.from(str2, 'hex');
    expectedHash2 =
      '9488f2f207d209a15f40ef011a2181bc847b37fb949f23f8e6026ec4882e364c';
    expectedRequestId2 =
      'a61e1962b228cf4a9820960a972575e2b5be936a6e01a3acfe400b6bbf498d5f';

    quorumEntryJSON = {
      "version": 1,
      "llmqType": 100,
      "quorumHash": "68d0a27a5e66178b555e802e2a608aa718f90ff16619e1fe03022165249d0e50",
      "signersCount": 3,
      "signers": "07",
      "validMembersCount": 3,
      "validMembers": "07",
      "quorumPublicKey": "8df99d16425af6db62a8cef42ee818c3332aa9635e38cdf68a4e8b42c75371613dae96d0b5ab41ab3533f5dc3bd8cd30",
      "quorumVvecHash": "573768c6bceef705c3cb8cffe0bf6369f60ea88a80125a60cbdf7da769f891dc",
      "quorumSig": "8d583e2cbd27d45170274783e9c3b8f3cf29f9b82ea95c2a1234347936eb765a66fc1719c14b175b0181c6f894e9db490d26b06e7e7ca581308c168dd54f14a7e828467f65b5dd44927e076384854fd772a5a87f792de9a94342436532730f09",
      "membersSig": "0fbfcac76ac6d1dbc1e713703ca6f156db6556db3b3686af54009b4a2911aeb1e2519e6e1a6eb8cb863a15b9829b07230e0abe9c53fdbd1a88840b90f9de1516f7ec9f60d5132dad7666ca5b2c90c1703e58c2c6f19b1a05b8ae32fc8cc46f41"
    };

    instantLockJSONFromTestNet = {
      version: 1,
      inputs: [
        {
          outpointHash:
            'c31f42fd4bb88ce8bf5f81bb6d63299a4d6796233830caa3978a0a858547882d',
          outpointIndex: 1,
        },
      ],
      txid: 'eac01453690c288f562e62c9bf13184f4ef99dd34bc85d016866cc18f6d6279d',
      cyclehash: '49ba70a3fc159ee138a9de44525c52cb13b14017e083b73f2cd414f15a5667e7',
      signature:
        '872b006bfa3b560fbf73e131e3ca58a0f594aed599b0b7bea036dc830b1a4352191a45e2cfee7ef8a2647dcaa64a23e405d16026bdf2796f7e00dc19a8dd769c746713b1a24720af5cd5fde25c95ad9850362c68680cb04b5c361ab4ca2764e1',
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
        expect(instantLockJSON).to.be.deep.equal(object);
      });
      it('should be able to parse data from another buffer', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str2);
        const instantLockJSON = instantLock.toObject();
        expect(instantLockJSON).to.be.deep.equal(object2);
      });
    });

    describe('fromObject', function () {
      it('Should be able to parse data from an object', function () {
        const instantLock = InstantLock.fromObject(object);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str);
      });
      it('Should be able to parse data from another object', function () {
        const instantLock = InstantLock.fromObject(object2);
        const instantLockStr = instantLock.toString();
        expect(instantLockStr).to.be.deep.equal(str2);
      });
    });

    describe('fromString', function () {
      it('Should be able to parse data from a hex string', function () {
        const instantLock = InstantLock.fromHex(str2);
        const instantLockJSON = instantLock.toObject();
        const instantLockBuffer = instantLock.toBuffer().toString('hex');
        expect(instantLockJSON).to.be.deep.equal(object2);
        expect(instantLockBuffer).to.be.deep.equal(buf2.toString('hex'));
      });
    });

    describe('clone itself', function () {
      it('can be instantiated from another instantlock', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        const instantLock2 = new InstantLock(instantLock);
        expect(instantLock2.toString()).to.be.equal(instantLock.toString());
      });
    });
  });

  describe('validation', function () {
    describe('#verifySignatureAgainstQuorum', function () {
      it('should verify signature against single quorum', async function () {
        const instantLock = new InstantLock(buf2);
        const requestId = instantLock.getRequestId();
        const isValid = await instantLock.verifySignatureAgainstQuorum(
          quorum,
          requestId
        );
        expect(isValid).to.equal(true);
      });
    });
    describe('#verify', function () {
      it('should verify signature against SMLStore', async function () {
        const instantLock = new InstantLock(buf2);
        const SMLStore = new SimplifiedMNListStore(JSON.parse(JSON.stringify(diffArrayFixture)));
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
      it('should not crash if BLS fails to parse the signature or any other data', async function () {
        const instantLock = new InstantLock(buf2);
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const SMLStore = new SimplifiedMNListStore(JSON.parse(JSON.stringify(diffArrayFixture)));
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(false);
      });
      it('should verify instant lock past the height in sml store', async function () {
        const SMLStore = new SimplifiedMNListStore([...diffArrayFixture, ...diffArrayAdditionalFixture]);

        // That's is an ISLock approximately from height 1180
        const instantLock = InstantLock.fromObject(
          {
            version: 1,
            inputs: [
              {
                outpointHash: 'e8cd2025e3341197c5b7aac82e0c7e19498a440d51a260414b60cafa9edc72ed',
                outpointIndex: 0
              }
            ],
            txid: '20b2f03ad56c8b7d283107f2a652865968bc1599d875d2bce5467a21f1c347ca',
            cyclehash: '0dc8d0df62b076a7757ab5ca07dde0f1e2bfaf83f94299fd9a77577e6cc7022e',
            signature: '87a91c454e55fb24b9829e3a4e751ab1ef4cfaaae6cbc00cb58c6066191ae2ee111931bef2a2596cef953fb5c4aa462d020407b47a5f5a89870ae422c5fd7f5c3e43d516b570d823764676ae55823504ec07a33e1952d28c4a3105ccf269175d'
          }
        );
        // It verifies for the store 1170-1200
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });

      it('should not crash if no quorum was found for the lock to verify', async function () {
        const SMLStore = new SimplifiedMNListStore(
          JSON.parse(JSON.stringify(diffArrayFixture))
        );
        // Proceeding with the test
        const instantLock = new InstantLock(buf2);
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(false);
      });

      it('should not crash if no quorum was found for the lock to verify with empty quorumList', async function () {
        // verifySignatureWithQuorumOffset should be called three times, because the quorumList is always empty
        const spy = sinon.spy(
          InstantLock.prototype,
          'verifySignatureWithQuorumOffset'
        );
        const SMLStore = SimplifiedMNListStore.fromJSON(
          getSMLStoreJSONFixtureNoQuorums()
        );
        // Proceeding with the test
        const instantLock = new InstantLock(buf2);
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const isValid = await instantLock.verify(SMLStore);
        sinon.assert.calledThrice(spy);
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
    });
  });

  describe('output', function () {
    describe('#copy', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(Buffer.from(str2, 'hex'));
        const instantLockCopy = instantLock.copy();
        expect(instantLockCopy).to.deep.equal(instantLock);
      });
    });

    describe('#toBuffer', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        expect(instantLock.toBuffer().toString('hex')).to.deep.equal(str2);
      });
    });

    describe('#toJSON/#toObject', function () {
      it('should output formatted output correctly', function () {
        const instantLock2 = InstantLock.fromBuffer(buf2);
        expect(instantLock2.toObject()).to.deep.equal(instantLock2.toJSON());
        expect(instantLock2.toObject()).to.deep.equal(object2);
      });
    });

    describe('#toString', function () {
      it('should output formatted output correctly', function () {
        const instantLock = InstantLock.fromBuffer(buf2);
        expect(instantLock.toString()).to.deep.equal(str2);
      });
    });

    describe('#inspect', function () {
      it('should output formatted output correctly', function () {
        const instantLock = new InstantLock(str);
        const output =
          '<InstantLock: e17f490ba5856baaf554903e4b08299fd64a9f64650a2c40672c590ae06d444b, sig: 85e12d70ca7118c5034004f93e45384079f46c6c2928b45cfc5d3ad640e70dfd87a9a3069899adfb3b1622daeeead19809b74354272ccf95290678f55c13728e3c5ee8f8417fcce3dfdca2a7c9c33ec981abdff1ec35a2e4b558c3698f01c1b8>';
        expect(instantLock.inspect()).to.be.equal(output);
      });
    });
  });

  describe('v17', () => {
    beforeEach(() => {
      str =
        '011dbbda5861b12d7523f20aa5e0d42f52de3dcd2d5c2fe919ba67b59f050d206e00000000babb35d229d6bf5897a9fc3770755868d9730e022dc04c8a7a7e9df9f1caccbe8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80';
      object = {
        inputs: [
          {
            outpointHash:
              '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
            outpointIndex: 0,
          },
        ],
        txid: 'becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba',
        signature:
          '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
      };
      buf = Buffer.from(str, 'hex');
    });

    describe('instantiation', () => {
      describe('#fromBuffer', () => {
        it('should be able to parse data from a buffer', () => {
          const instantLock = InstantLock.fromBuffer(buf);
          const instantLockStr = instantLock.toString();
          expect(instantLockStr).to.be.deep.equal(str);
          const instantLockJSON = instantLock.toObject();
          expect(instantLockJSON).to.be.deep.equal(object);
        });
      });

      describe('#fromObject', () => {
        it('should be able to parse data from an object', () => {
          const instantLock = InstantLock.fromObject(object);
          const instantLockStr = instantLock.toString();
          expect(instantLockStr).to.be.deep.equal(str);
        });
      });

      describe('#fromString', () => {
        it('should be able to parse data from a hex string', () => {
          const instantLock = InstantLock.fromHex(str);
          const instantLockJSON = instantLock.toObject();
          const instantLockBuffer = instantLock.toBuffer().toString('hex');
          expect(instantLockJSON).to.be.deep.equal(object);
          expect(instantLockBuffer).to.be.deep.equal(buf.toString('hex'));
        });
      });

      describe('#copy', () => {
        it('can be instantiated from another instantlock', () => {
          const instantLock = InstantLock.fromBuffer(buf);
          const instantLock2 = new InstantLock(instantLock);
          expect(instantLock2.toString()).to.be.equal(instantLock.toString());
        });
      });
    });

    describe('output', function () {
      describe('#copy', function () {
        it('should output formatted output correctly', function () {
          it('should output formatted output correctly', function () {
            const instantLock = InstantLock.fromBuffer(Buffer.from(str, 'hex'));
            const instantLockCopy = instantLock.copy();
            expect(instantLockCopy).to.deep.equal(instantLock);
          });
        });
      });

      describe('#toBuffer', function () {
        it('should output formatted output correctly', function () {
          const instantLock = InstantLock.fromBuffer(buf);
          expect(instantLock.toBuffer().toString('hex')).to.deep.equal(str);
        });
      });

      describe('#toJSON/#toObject', function () {
        it('should output formatted output correctly', function () {
          const instantLock = InstantLock.fromBuffer(buf);
          expect(instantLock.toObject()).to.deep.equal(instantLock.toJSON());
          expect(instantLock.toObject()).to.deep.equal(object);
        });
      });

      describe('#toString', function () {
        it('should output formatted output correctly', function () {
          const instantLock = InstantLock.fromBuffer(buf);
          expect(instantLock.toString()).to.deep.equal(str);
        });
      });
    });
  });
});
