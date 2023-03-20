'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const bitcore = require('../../index');
const SimplifiedMNListStore = require('../../lib/deterministicmnlist/SimplifiedMNListStore');
const InstantLock = bitcore.InstantLock;
const QuorumEntry = bitcore.QuorumEntry;

const diffArrayFixture = require('../fixtures/v19diffArray1724-1739.json');
const diffArrayAdditionalFixture = require('../fixtures/v19diffArray1739-1756.json');
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
      '013c4493ff16e63720c9c46fe866ef9e49b1787369e387a4f7267d29df37c31ae6010000009a0626badd140d5c8265eeb429aa91b2c371656ccdd993a2682eb69396b85806879660757405ddc5dbb88d6366333032b901101b9bc3bff47d1d48189645a3ec8757142e749fa885ddf293817d669e4e12650b0d1c2111e4f98e2613e59ba09cf60f29c31260c9fc12a77f92ecfb5d22e36678808193052c5b71a2b659a2642c';

    object = {
      inputs: [
        {
          outpointHash: 'e61ac337df297d26f7a487e3697378b1499eef66e86fc4c92037e616ff93443c',
          outpointIndex: 1
        }
      ],
      txid: '0658b89693b62e68a293d9cd6c6571c3b291aa29b4ee65825c0d14ddba26069a',
      signature: '879660757405ddc5dbb88d6366333032b901101b9bc3bff47d1d48189645a3ec8757142e749fa885ddf293817d669e4e12650b0d1c2111e4f98e2613e59ba09cf60f29c31260c9fc12a77f92ecfb5d22e36678808193052c5b71a2b659a2642c'
    };
    buf = Buffer.from(str, 'hex');
    expectedHash =
      '5d74dc66f9584b4178b3bb42aa0f9d8c5fb4fdb0e3f78267faaaf2845c884ef0';
    expectedRequestId =
      '2fad2b4fa149419ab3363a65242bd1472e213e7dddd210f73bb989999bab2a8f';

    str2 =
      '019a0626badd140d5c8265eeb429aa91b2c371656ccdd993a2682eb69396b85806000000003a5b2aa5d4c53707acff4d4f6253cedd1184e28b0e600dc91e2069d9f0b1518bb375c32bdb9a66a8b869abd20ca28b92f08fede20577e9f5edd5b1f122747e2afb375a07749a7c8db56c40636bfa5fc5099788852cfbebf8999faf079061988320363fbdca9024afdcd0b11f622ffa8d7edb285c11f4d4c76c072950ac3eab1c';
    object2 = {
      inputs: [
        {
          outpointHash: '0658b89693b62e68a293d9cd6c6571c3b291aa29b4ee65825c0d14ddba26069a',
          outpointIndex: 0
        }
      ],
      txid: '8b51b1f0d969201ec90d600e8be28411ddce53624f4dffac0737c5d4a52a5b3a',
      signature: 'b375c32bdb9a66a8b869abd20ca28b92f08fede20577e9f5edd5b1f122747e2afb375a07749a7c8db56c40636bfa5fc5099788852cfbebf8999faf079061988320363fbdca9024afdcd0b11f622ffa8d7edb285c11f4d4c76c072950ac3eab1c'
    };
    buf2 = Buffer.from(str2, 'hex');
    expectedHash2 =
      '20322c13368e9e7ea1dc5d85a2aead21447fb67f965b29aed10e0b51a6767b57';
    expectedRequestId2 =
      '28a6d1d575437929f51a42d9a8afb758e308216fecce1ce641326d9c55834f64';

    quorumEntryJSON = {
      isVerified: false,
      isOutdatedRPC: false,
      version: 3,
      llmqType: 104,
      quorumHash: '79aa3c3d5ff180aa6d200d78785894466190d4421eef3d86f442dde4257f1725',
      quorumIndex: 0,
      signersCount: 3,
      signers: '07',
      validMembersCount: 3,
      validMembers: '07',
      quorumPublicKey: 'aaca742e2c94a1e216d96cb7de81089130954599ec987a47c272c1ae97aa17953b619b03b7b1a39f5ce6a17b1a1e583a',
      quorumVvecHash: '963ea8d183225dac6696009e789b0913c435093ea4eea3444c8ff5318cbb73fd',
      quorumSig: '85714c17dac8d6f6161d4894a56a8f014887e7755c4bf48f34c83e71ba8ea80bba3670489b37a6db7085ac83cb504ee90a08127e4958686fede397e8a2a3e4edc86bf760dcce184bfdcb93334500023373fbbcfa468b8c79e4c6274f11362d7f',
      membersSig: 'b5d9563394f90a2526de899619137c8dd4a17c5f42767f4bd5e32446105f10adf0eb5df9cc47f9b96d94269e2e759a3007374ae1f9285e4f7f7ca2458aa486c90d2d2d19ba75f9ad3667e0d528603f6ec755660b3733c6c7bebf7d1863bf7388'
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
        const instantLock = new InstantLock(buf);
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
        const instantLock = new InstantLock(Buffer.from(
          str,
          'hex',
          ));
        const SMLStore = new SimplifiedMNListStore(JSON.parse(JSON.stringify(diffArrayFixture)));
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(true);
      });
      it('should not crash if BLS fails to parse the signature or any other data', async function () {
        const instantLock = new InstantLock(Buffer.from('01da0dfd2000cf06d41a4eabe5c4ab5927c2ad59a0bf22df7211646e65b631a1c201000000766a483d06cc3498f6e957cc119e2a1cb5a8507a3f6d416f1388cb922ee6a03c99bba712d10e546b0049c96cbcb6c1ce2147f61e1d0617aafa0f42bee763d68a8d3bcd49caddbc64a6587d195b9f1d7505b642b2ca9c9d7e25ca3ec70048ad754a52f91e6512a2d9cf26201a9307c9d14dc2f915bdc839d406b1778d442a748c', 'hex'));
        expect(instantLock.signature.length).to.be.equal(192);
        instantLock.signature = '0'.repeat(192);
        const SMLStore = new SimplifiedMNListStore(JSON.parse(JSON.stringify(diffArrayFixture)));
        const isValid = await instantLock.verify(SMLStore);
        expect(isValid).to.equal(false);
      });
      it('should verify instant lock past the height in sml store', async function () {
        const additionalDiff = diffArrayAdditionalFixture.slice(1);
        const SMLStore = new SimplifiedMNListStore([...diffArrayFixture, ...additionalDiff]);

        // That's an ISLock approximately from height 1180
        const instantLock = InstantLock.fromBuffer(
          Buffer.from('013c4493ff16e63720c9c46fe866ef9e49b1787369e387a4f7267d29df37c31ae600000000c3576ff9c4e05e648bacb02a1b77bab9a44dc7ac8cfa3a05929d60f632692676a779cc094dbd217be325cf104726eaa0071abb95e2e97db26a58bf9f2f28cb3293835e9c6e7f460080256e1f9efb5fcc058cac141aa6643b6346c57f2b4a0e8027c27a953955bdb8a3893db39166667b5d83ac112a6dcc1ec2393cb7d8956cf8', 'hex')
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
          '<InstantLock: 0658b89693b62e68a293d9cd6c6571c3b291aa29b4ee65825c0d14ddba26069a, sig: 879660757405ddc5dbb88d6366333032b901101b9bc3bff47d1d48189645a3ec8757142e749fa885ddf293817d669e4e12650b0d1c2111e4f98e2613e59ba09cf60f29c31260c9fc12a77f92ecfb5d22e36678808193052c5b71a2b659a2642c>';
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
        it('should be able to handle false-positive v18', () => {
          const instantLockString = '0104edf83df6cba7c6535272d91eeff5ff2eda5a579d51389b381e10f580ff80b7010000004d48cc7b66105699422fe0db7212c033a84fbc7dcf799550a1038ff6f30aa1220291fcfb6d44c06780ac475ce5cb3dd4c7f565888f485252cb4ae6ad206161b2f58655752c8e74f5ef627813870e94490fa7c1634361054fb1b81dd751a9dcd8419dc00dd17282729c474ecf4aae9053dbbcc43e02710f8f899db38be8d649e5'
          const instantLockObject = {
            inputs: [
              {
                outpointHash: 'b780ff80f5101e389b38519d575ada2efff5ef1ed9725253c6a7cbf63df8ed04',
                outpointIndex: 1
              }
            ],
            txid: '22a10af3f68f03a1509579cf7dbc4fa833c01272dbe02f42995610667bcc484d',
            signature: '0291fcfb6d44c06780ac475ce5cb3dd4c7f565888f485252cb4ae6ad206161b2f58655752c8e74f5ef627813870e94490fa7c1634361054fb1b81dd751a9dcd8419dc00dd17282729c474ecf4aae9053dbbcc43e02710f8f899db38be8d649e5'
          };

          const instantLock = new InstantLock(instantLockString);
          const string = instantLock.toString();
          expect(string).to.equal(instantLockString);
          const object = instantLock.toObject();
          expect(object).to.be.deep.equal(instantLockObject);
        })
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
