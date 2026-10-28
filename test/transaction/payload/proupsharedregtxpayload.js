const { expect } = require('chai');
const DashcoreLib = require('../../..');

const fixtures = require('../../fixtures/core24-shared-masternode.json');
const {
  highS,
  badHeader,
} = require('../../fixtures/malleatedcompactsignatures');

const { Address, PrivateKey, Signer } = DashcoreLib;
const { ProUpSharedRegTxPayload } = DashcoreLib.Transaction.Payload;

const vectors = fixtures.transactions.filter((vector) => vector.type === 12);

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProUpSharedRegTxPayload', () => {
  const [vector] = vectors;
  const raw = Buffer.from(vector.extraPayload, 'hex');

  vectors.forEach((coreVector) => {
    describe(`Core vector: ${coreVector.description}`, () => {
      const coreRaw = Buffer.from(coreVector.extraPayload, 'hex');

      it('should parse the fields Core decodes', () => {
        const payload = ProUpSharedRegTxPayload.fromBuffer(
          Buffer.from(coreRaw)
        );
        expect(payload.version).to.equal(coreVector.decoded.version);
        expect(payload.proTxHash).to.equal(coreVector.decoded.proTxHash);
        expect(payload.pubKeyOperator).to.equal(
          coreVector.decoded.pubKeyOperator
        );
        expect(payload.inputsHash).to.equal(coreVector.decoded.inputsHash);
        expect(payload.payloadSigs).to.have.lengthOf(
          coreVector.decoded.sigCount
        );
        // keyIDVoting is kept byte-reversed, like the other ProTx payloads
        const votingAddress = Address.fromPublicKeyHash(
          Buffer.from(payload.keyIDVoting, 'hex').reverse(),
          'testnet'
        );
        expect(votingAddress.toString()).to.equal(
          coreVector.decoded.votingAddress
        );
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', () => {
        const payload = ProUpSharedRegTxPayload.fromBuffer(
          Buffer.from(coreRaw)
        );
        expect(payload.toBuffer()).to.deep.equal(coreRaw);
        expect(
          ProUpSharedRegTxPayload.fromJSON(payload.toJSON()).toBuffer()
        ).to.deep.equal(coreRaw);
        expect(payload.copy().toBuffer()).to.deep.equal(coreRaw);
      });

      it('should verify one signature per share, in share order', () => {
        const payload = ProUpSharedRegTxPayload.fromBuffer(
          Buffer.from(coreRaw)
        );
        const owners = coreVector.shareOwnerAddresses;
        expect(payload.payloadSigs).to.have.lengthOf(owners.length);
        owners.forEach((owner, index) => {
          const otherOwner = owners[(index + 1) % owners.length];
          expect(payload.verifySignature(keyId(owner), index)).to.equal(true);
          expect(payload.verifySignature(keyId(otherOwner), index)).to.equal(
            false
          );
        });
      });
    });
  });

  describe('canonical signatures', () => {
    it('should reject a high-S copy or a bad recovery header of a valid signature', () => {
      const payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
      const owner = keyId(vector.shareOwnerAddresses[0]);
      const [sig] = payload.payloadSigs;
      const hash = payload.getHash({ skipSignature: true });
      expect(
        Signer.verifyHashSignature(hash, Buffer.from(highS(sig), 'hex'), owner)
      ).to.equal(true);
      [highS(sig), badHeader(sig)].forEach((malleated) => {
        payload.payloadSigs[0] = malleated;
        expect(payload.verifySignature(owner, 0)).to.equal(false);
      });
    });
  });

  describe('serialization', () => {
    it('should omit the signature list with skipSignature, as Core hashes the payload', () => {
      const payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
      const unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.deep.equal(
        raw.slice(0, raw.length - 1 - 65 * payload.payloadSigs.length)
      );
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property(
        'payloadSigs'
      );
    });

    it('should serialize an unsigned payload with an empty signature list', () => {
      const json = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
        skipSignature: true,
      });
      const bytes = ProUpSharedRegTxPayload.fromJSON(json).toBuffer();
      expect(bytes[bytes.length - 1]).to.equal(0);
      expect(
        ProUpSharedRegTxPayload.fromBuffer(bytes).payloadSigs
      ).to.deep.equal([]);
    });

    it('should throw when the raw payload has trailing bytes', () => {
      expect(() =>
        ProUpSharedRegTxPayload.fromBuffer(
          Buffer.from(`${vector.extraPayload}00`, 'hex')
        )
      ).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('#sign', () => {
    it('should append signatures of the payload hash in signing order', () => {
      const keys = [new PrivateKey(), new PrivateKey()];
      const payload = ProUpSharedRegTxPayload.fromJSON(
        ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
          skipSignature: true,
        })
      );
      keys.forEach((key) => payload.sign(key));
      const restored = ProUpSharedRegTxPayload.fromBuffer(payload.toBuffer());
      keys.forEach((key, index) => {
        expect(
          restored.verifySignature(key.toAddress().hashBuffer, index)
        ).to.equal(true);
      });
      expect(
        restored.verifySignature(keys[1].toAddress().hashBuffer, 0)
      ).to.equal(false);
    });
  });

  describe('#validate', () => {
    const json = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON();

    it('should reject malformed fields', () => {
      [
        { version: 0x10000 },
        { proTxHash: 'ab' },
        { pubKeyOperator: json.pubKeyOperator.slice(2) },
        { keyIDVoting: `${json.keyIDVoting}00` },
        { inputsHash: 'ab' },
        { payloadSigs: ['00'] },
        { payloadSigs: new Array(256).fill(json.payloadSigs[0]) },
      ].forEach((override) => {
        expect(() =>
          ProUpSharedRegTxPayload.fromJSON({ ...json, ...override })
        ).to.throw();
      });
    });
  });
});
