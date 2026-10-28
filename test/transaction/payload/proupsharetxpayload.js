const { expect } = require('chai');
const DashcoreLib = require('../../..');

const fixtures = require('../../fixtures/core24-shared-masternode.json');
const {
  highS,
  badHeader,
} = require('../../fixtures/malleatedcompactsignatures');

const { Address, PrivateKey, Script, Signer } = DashcoreLib;
const { ProUpShareTxPayload } = DashcoreLib.Transaction.Payload;

const vectors = fixtures.transactions.filter((vector) => vector.type === 11);

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProUpShareTxPayload', () => {
  const [vector] = vectors;
  const raw = Buffer.from(vector.extraPayload, 'hex');

  vectors.forEach((coreVector) => {
    describe(`Core vector: ${coreVector.description}`, () => {
      const coreRaw = Buffer.from(coreVector.extraPayload, 'hex');

      it('should parse the fields Core decodes', () => {
        const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(coreRaw));
        const json = payload.toJSON({ network: 'testnet' });
        expect(json.version).to.equal(coreVector.decoded.version);
        expect(json.proTxHash).to.equal(coreVector.decoded.proTxHash);
        expect(json.shareIndex).to.equal(coreVector.decoded.shareIndex);
        expect(json.rewardAddress).to.equal(coreVector.decoded.rewardAddress);
        expect(json.inputsHash).to.equal(coreVector.decoded.inputsHash);
        expect(payload.scriptReward).to.equal(
          Script.fromAddress(coreVector.decoded.rewardAddress).toHex()
        );
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', () => {
        const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(coreRaw));
        const json = payload.toJSON({ network: 'testnet' });
        expect(payload.toBuffer()).to.deep.equal(coreRaw);
        expect(ProUpShareTxPayload.fromJSON(json).toBuffer()).to.deep.equal(
          coreRaw
        );
        expect(payload.copy().toBuffer()).to.deep.equal(coreRaw);
      });

      it('should verify the signature against the owner of the updated share', () => {
        const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(coreRaw));
        const owners = coreVector.shareOwnerAddresses;
        const { shareIndex } = coreVector.decoded;
        const otherOwner = owners[(shareIndex + 1) % owners.length];
        expect(payload.verifySignature(keyId(owners[shareIndex]))).to.equal(
          true
        );
        expect(payload.verifySignature(keyId(otherOwner))).to.equal(false);
      });
    });
  });

  describe('canonical signatures', () => {
    it('should reject a high-S copy or a bad recovery header of a valid signature', () => {
      const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
      const owner = keyId(
        vector.shareOwnerAddresses[vector.decoded.shareIndex]
      );
      const sig = payload.payloadSig;
      const hash = payload.getHash({ skipSignature: true });
      expect(
        Signer.verifyHashSignature(hash, Buffer.from(highS(sig), 'hex'), owner)
      ).to.equal(true);
      [highS(sig), badHeader(sig)].forEach((malleated) => {
        payload.payloadSig = malleated;
        expect(payload.verifySignature(owner)).to.equal(false);
      });
    });
  });

  describe('serialization', () => {
    it('should omit the signature with skipSignature, as Core hashes the payload', () => {
      const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
      const unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.deep.equal(raw.slice(0, raw.length - 66));
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property(
        'payloadSig'
      );
    });

    it('should serialize an unsigned payload with an empty signature', () => {
      const json = ProUpShareTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
        skipSignature: true,
      });
      const bytes = ProUpShareTxPayload.fromJSON(json).toBuffer();
      expect(bytes).to.deep.equal(
        Buffer.concat([raw.slice(0, raw.length - 66), Buffer.from([0])])
      );
      expect(ProUpShareTxPayload.fromBuffer(bytes).payloadSig).to.equal(
        undefined
      );
    });

    it('should throw when the raw payload has trailing bytes', () => {
      expect(() =>
        ProUpShareTxPayload.fromBuffer(
          Buffer.from(`${vector.extraPayload}00`, 'hex')
        )
      ).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('#sign', () => {
    it('should sign the payload hash with the share owner key', () => {
      const key = new PrivateKey();
      const payload = ProUpShareTxPayload.fromJSON(
        ProUpShareTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
          skipSignature: true,
        })
      );
      payload.sign(key);
      expect(payload.payloadSig).to.have.lengthOf(130);
      expect(payload.verifySignature(key.toAddress().hashBuffer)).to.equal(
        true
      );
      const restored = ProUpShareTxPayload.fromBuffer(payload.toBuffer());
      expect(restored.verifySignature(key.toAddress().hashBuffer)).to.equal(
        true
      );
    });
  });

  describe('#validate', () => {
    it('should reject malformed fields', () => {
      const payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
      [
        { proTxHash: 'ab' },
        { shareIndex: -1 },
        { shareIndex: 0x10000 },
        { version: 0x10000 },
        { inputsHash: 'ab' },
        { payloadSig: '00' },
        { scriptReward: '6a' },
      ].forEach((override) => {
        const copy = Object.assign(payload.copy(), override);
        expect(() => copy.validate()).to.throw();
      });
    });
  });
});
