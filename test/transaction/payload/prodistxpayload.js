const { expect } = require('chai');
const DashcoreLib = require('../../..');

const fixtures = require('../../fixtures/core24-shared-masternode.json');
const {
  highS,
  badHeader,
} = require('../../fixtures/malleatedcompactsignatures');

const { Address, PrivateKey, Signer, Transaction } = DashcoreLib;
const { ProDisTxPayload } = Transaction.Payload;

const vectors = fixtures.transactions.filter((vector) => vector.type === 10);

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProDisTxPayload', () => {
  const unilateral = vectors[0];
  const unanimous = vectors[vectors.length - 1];

  vectors.forEach((vector) => {
    describe(`Core vector: ${vector.description}`, () => {
      const raw = Buffer.from(vector.extraPayload, 'hex');

      it('should parse the fields Core decodes', () => {
        const payload = ProDisTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.version).to.equal(vector.decoded.version);
        expect(payload.proTxHash).to.equal(vector.decoded.proTxHash);
        expect(payload.actorIndex).to.equal(vector.decoded.actorIndex);
        expect(payload.payloadSigs).to.have.lengthOf(vector.decoded.sigCount);
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', () => {
        const payload = ProDisTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.toBuffer()).to.deep.equal(raw);
        expect(
          ProDisTxPayload.fromJSON(payload.toJSON()).toBuffer()
        ).to.deep.equal(raw);
        expect(payload.copy().toBuffer()).to.deep.equal(raw);
      });

      it('should verify every signature against the share owner that made it', () => {
        const tx = new Transaction(vector.hex);
        const payload = tx.extraPayload;
        const owners = vector.shareOwnerAddresses;
        const isUnilateral = payload.payloadSigs.length === 1;
        payload.payloadSigs.forEach((sig, index) => {
          const owner = isUnilateral ? payload.actorIndex : index;
          const otherOwner = (owner + 1) % owners.length;
          expect(
            payload.verifySignature(keyId(owners[owner]), tx, index)
          ).to.equal(true);
          expect(
            payload.verifySignature(keyId(owners[otherOwner]), tx, index)
          ).to.equal(false);
        });
      });
    });
  });

  describe('canonical signatures', () => {
    fixtures.nonCanonicalProDisTxs.forEach((vector) => {
      it(`should reject the Core ${vector.description}`, () => {
        const tx = new Transaction(vector.hex);
        const payload = tx.extraPayload;
        const owners = vector.shareOwnerAddresses;
        expect(tx.hash).to.equal(vector.txid);
        expect(payload.verifySignature(keyId(owners[0]), tx, 0)).to.equal(
          false
        );
        for (let index = 1; index < owners.length; index++) {
          expect(
            payload.verifySignature(keyId(owners[index]), tx, index)
          ).to.equal(true);
        }
      });
    });

    it('should reject the Core high-S vector although it recovers the owner key', () => {
      const vector = fixtures.nonCanonicalProDisTxs[0];
      const tx = new Transaction(vector.hex);
      const payload = tx.extraPayload;
      const signHash = payload.getSignHash(tx, payload.payloadSigs.length);
      const owner = keyId(vector.shareOwnerAddresses[0]);
      const sig = Buffer.from(payload.payloadSigs[0], 'hex');
      expect(Signer.verifyHashSignature(signHash, sig, owner)).to.equal(true);
      expect(payload.verifySignature(owner, tx, 0)).to.equal(false);
    });

    it('should reject a high-S copy or a bad recovery header of a valid signature', () => {
      const tx = new Transaction(unilateral.hex);
      const payload = tx.extraPayload;
      const owner = keyId(unilateral.shareOwnerAddresses[payload.actorIndex]);
      const [sig] = payload.payloadSigs;
      expect(payload.verifySignature(owner, tx)).to.equal(true);
      expect(
        Signer.verifyHashSignature(
          payload.getSignHash(tx, 1),
          Buffer.from(highS(sig), 'hex'),
          owner
        )
      ).to.equal(true);
      [highS(sig), badHeader(sig)].forEach((malleated) => {
        payload.payloadSigs = [malleated];
        expect(payload.verifySignature(owner, tx)).to.equal(false);
      });
    });
  });

  describe('#getSignHash', () => {
    it('should commit to the signature count, which selects the mode', () => {
      const tx = new Transaction(unilateral.hex);
      expect(tx.extraPayload.getSignHash(tx, 1)).to.not.deep.equal(
        tx.extraPayload.getSignHash(tx, 2)
      );
    });

    it('should commit to the transaction locktime, sequences and outputs', () => {
      const owner = keyId(
        unilateral.shareOwnerAddresses[unilateral.decoded.actorIndex]
      );
      const mutations = [
        (tx) => Object.assign(tx, { nLockTime: 1 }),
        (tx) =>
          Object.assign(tx.inputs[0], {
            sequenceNumber: tx.inputs[0].sequenceNumber - 1,
          }),
        (tx) =>
          Object.assign(tx.outputs[0], {
            satoshis: tx.outputs[0].satoshis - 1,
          }),
      ];
      mutations.forEach((mutate) => {
        const tx = new Transaction(unilateral.hex);
        expect(tx.extraPayload.verifySignature(owner, tx)).to.equal(true);
        mutate(tx);
        expect(tx.extraPayload.verifySignature(owner, tx)).to.equal(false);
      });
    });

    it('should reject a signature count that does not fit in a byte', () => {
      const tx = new Transaction(unilateral.hex);
      expect(() => tx.extraPayload.getSignHash(tx, 256)).to.throw(
        'Expected sigCount'
      );
    });

    it('should reject a transaction that is not a version 3+ dissolution', () => {
      const tx = new Transaction(unilateral.hex);
      const payload = tx.extraPayload;
      tx.type = Transaction.TYPES.TRANSACTION_PROVIDER_UPDATE_SHARE;
      expect(() => payload.getSignHash(tx, 1)).to.throw('provider dissolve');
      tx.type = Transaction.TYPES.TRANSACTION_PROVIDER_DISSOLVE;
      tx.version = 2;
      expect(() => payload.getSignHash(tx, 1)).to.throw('provider dissolve');
    });
  });

  describe('#sign', () => {
    it('should append signatures that verify, in signing order', () => {
      const tx = new Transaction(unanimous.hex);
      const keys = [new PrivateKey(), new PrivateKey()];
      const payload = ProDisTxPayload.fromJSON(
        tx.extraPayload.toJSON({ skipSignature: true })
      );
      keys.forEach((key) => payload.sign(key, tx, keys.length));

      expect(payload.payloadSigs).to.have.lengthOf(2);
      keys.forEach((key, index) => {
        expect(
          payload.verifySignature(key.toAddress().hashBuffer, tx, index)
        ).to.equal(true);
      });
      expect(
        payload.verifySignature(keys[0].toAddress().hashBuffer, tx, 1)
      ).to.equal(false);
    });

    it('should not verify a unilateral signature as part of a unanimous set', () => {
      const tx = new Transaction(unilateral.hex);
      const key = new PrivateKey();
      const payload = ProDisTxPayload.fromJSON(
        tx.extraPayload.toJSON({ skipSignature: true })
      );
      payload.sign(key, tx, 1);
      expect(payload.verifySignature(key.toAddress().hashBuffer, tx)).to.equal(
        true
      );
      payload.payloadSigs.push(payload.payloadSigs[0]);
      expect(payload.verifySignature(key.toAddress().hashBuffer, tx)).to.equal(
        false
      );
    });
  });

  describe('serialization', () => {
    it('should drop the signatures with skipSignature', () => {
      const payload = ProDisTxPayload.fromBuffer(
        Buffer.from(unanimous.extraPayload, 'hex')
      );
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property(
        'payloadSigs'
      );
      const unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.have.lengthOf(37);
      expect(unsigned[36]).to.equal(0);
      expect(ProDisTxPayload.fromBuffer(unsigned).payloadSigs).to.deep.equal(
        []
      );
    });

    it('should throw when the raw payload has trailing bytes', () => {
      expect(() =>
        ProDisTxPayload.fromBuffer(
          Buffer.from(`${unilateral.extraPayload}00`, 'hex')
        )
      ).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });

    it('should throw when the signature list is truncated', () => {
      expect(() =>
        ProDisTxPayload.fromBuffer(
          Buffer.from(unilateral.extraPayload.slice(0, -2), 'hex')
        )
      ).to.throw('expected 65 more bytes, found 64');
    });

    it('should throw when the proTxHash is truncated', () => {
      expect(() =>
        ProDisTxPayload.fromBuffer(
          Buffer.from(unilateral.extraPayload.slice(0, 2 * 20), 'hex')
        )
      ).to.throw('expected 32 more bytes, found 18');
    });
  });

  describe('#validate', () => {
    const json = ProDisTxPayload.fromBuffer(
      Buffer.from(unilateral.extraPayload, 'hex')
    ).toJSON();

    it('should reject malformed fields', () => {
      [
        { proTxHash: 'ab' },
        { actorIndex: -1 },
        { actorIndex: 1.5 },
        { payloadSigs: ['00'] },
        { payloadSigs: 'ab' },
      ].forEach((override) => {
        expect(() =>
          ProDisTxPayload.fromJSON({ ...json, ...override })
        ).to.throw();
      });
    });

    it('should reject version and actorIndex values that do not fit in 16 bits', () => {
      expect(() =>
        ProDisTxPayload.fromJSON({ ...json, version: 0x10000 })
      ).to.throw('Expected version');
      expect(() =>
        ProDisTxPayload.fromJSON({ ...json, actorIndex: 0x10000 })
      ).to.throw('Expected actorIndex');
      expect(
        ProDisTxPayload.fromJSON({ ...json, actorIndex: 0xffff }).toBuffer()
      ).to.have.lengthOf(unilateral.extraPayload.length / 2);
    });

    it('should reject more signatures than the count byte can hold', () => {
      const payloadSigs = new Array(256).fill(json.payloadSigs[0]);
      expect(() => ProDisTxPayload.fromJSON({ ...json, payloadSigs })).to.throw(
        'Expected payloadSigs'
      );
    });
  });
});
