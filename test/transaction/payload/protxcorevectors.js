const { expect } = require('chai');

const DashcoreLib = require('../../../index');
const fixtures = require('../../fixtures/core24-protx.json');

const { Address, Block, Transaction } = DashcoreLib;
const {
  ProRegTxPayload,
  ProTxUpServPayload,
  ProUpRegTxPayload,
  ProUpRevTxPayload,
} = DashcoreLib.Transaction.Payload;

// Regtest, devnet and testnet share address prefixes
const network = 'testnet';

const payloadClasses = {
  proRegTx: ProRegTxPayload,
  proUpServTx: ProTxUpServPayload,
  proUpRegTx: ProUpRegTxPayload,
  proUpRevTx: ProUpRevTxPayload,
};

/**
 * @param {string} keyID - hex in the payload JSON byte order
 * @return {string}
 */
function keyIDToAddress(keyID) {
  return Address.fromPublicKeyHash(Buffer.from(keyID, 'hex').reverse(), network).toString();
}

function expectPayoutsLikeCore(payload, json, core) {
  const corePayouts = core.payouts || [];
  expect(json.payouts).to.deep.equal(
    corePayouts.map((payout) => ({ address: payout.address, reward: payout.reward })),
  );
  expect(payload.payouts.map((payout) => payout.scriptPayout)).to.deep.equal(
    corePayouts.map((payout) => payout.script),
  );
}

const expectLikeCore = {
  proRegTx(payload, json, core) {
    expect(payload.type).to.equal(core.type);
    expect(json.collateralHash).to.equal(core.collateralHash);
    expect(json.collateralIndex).to.equal(core.collateralIndex);
    expect(json.pubKeyOperator).to.equal(core.pubKeyOperator);
    expect(keyIDToAddress(json.keyIDVoting)).to.equal(core.votingAddress);
    if (core.ownerAddress) {
      expect(keyIDToAddress(json.keyIDOwner)).to.equal(core.ownerAddress);
    }
    expect(json.operatorReward).to.equal(Math.round(core.operatorReward * 100));
    expect(json.inputsHash).to.equal(core.inputsHash);
    if (core.platformNodeID) {
      expect(json.platformNodeID).to.equal(core.platformNodeID);
    }

    if (core.version < 3) {
      expect(json.service).to.equal(core.addresses.core_p2p[0]);
      expect(json.payoutAddress).to.equal(core.payoutAddress);
      return;
    }

    expect(json.addresses).to.deep.equal(core.addresses);
    expect(json).to.not.have.property('service');
    expect(json).to.not.have.property('platformP2PPort');
    expect(json).to.not.have.property('platformHTTPPort');
    expectPayoutsLikeCore(payload, json, core);
    // Core reports the effective reward script, the refund script when the share has none
    expect(
      json.shares.map((share) => ({
        amount: share.amount,
        refundAddress: share.refundAddress,
        rewardAddress: share.rewardAddress || share.refundAddress,
        ownerAddress: keyIDToAddress(share.keyIDOwner),
      })),
    ).to.deep.equal(
      (core.shares || []).map((share) => ({
        amount: share.amount,
        refundAddress: share.refundAddress,
        rewardAddress: share.rewardAddress,
        ownerAddress: share.ownerAddress,
      })),
    );
    expect(json.joinSigs).to.have.lengthOf(json.shares.length);
    expect(json.earlyPeriodBlocks).to.equal(core.earlyPeriodBlocks || 0);
    expect(json.earlyPenalty).to.equal(core.earlyPenalty || 0);
  },

  proUpServTx(payload, json, core) {
    expect(json.type).to.equal(core.type);
    expect(json.proTxHash).to.equal(core.proTxHash);
    expect(json.addresses).to.deep.equal(core.addresses);
    expect(json.operatorPayoutAddress).to.equal(core.operatorPayoutAddress);
    expect(json.platformNodeID).to.equal(core.platformNodeID);
    expect(json.inputsHash).to.equal(core.inputsHash);
    expect(json).to.not.have.property('service');
    expect(json).to.not.have.property('platformP2PPort');
    expect(json).to.not.have.property('platformHTTPPort');
  },

  proUpRegTx(payload, json, core) {
    expect(json.proTxHash).to.equal(core.proTxHash);
    expect(json.pubKeyOperator).to.equal(core.pubKeyOperator);
    expect(keyIDToAddress(json.keyIDVoting)).to.equal(core.votingAddress);
    expect(json).to.not.have.property('payoutAddress');
    expectPayoutsLikeCore(payload, json, core);
    expect(json.inputsHash).to.equal(core.inputsHash);
  },

  proUpRevTx(payload, json, core) {
    expect(json.proTxHash).to.equal(core.proTxHash);
    expect(json.reason).to.equal(core.reason);
    expect(json.inputsHash).to.equal(core.inputsHash);
  },
};

describe('ProTx payloads produced by Dash Core', () => {
  fixtures.transactions.forEach((vector) => {
    describe(`${vector.name} (${vector.source})`, () => {
      const PayloadClass = payloadClasses[vector.coreKey];
      let transaction;
      let rawPayload;

      beforeEach(() => {
        transaction = new Transaction(Buffer.from(vector.hex, 'hex'));
        rawPayload = transaction.extraPayload.toBuffer();
      });

      it('should parse and re-serialize the transaction byte for byte', () => {
        const raw = Buffer.from(vector.hex, 'hex');
        const parsed = new Transaction(raw);

        expect(parsed.extraPayload).to.be.an.instanceOf(PayloadClass);
        expect(parsed.extraPayload.version).to.equal(vector.core.version);
        expect(parsed.toString()).to.equal(vector.hex);
        expect(parsed.hash).to.equal(vector.txid);
        // parsing must not modify the caller's buffer
        expect(raw.toString('hex')).to.equal(vector.hex);
      });

      it('should parse and re-serialize the payload byte for byte', () => {
        const payload = PayloadClass.fromBuffer(Buffer.from(rawPayload));

        expect(payload.toBuffer()).to.deep.equal(rawPayload);
        expect(payload.copy().toBuffer()).to.deep.equal(rawPayload);
      });

      it('should report the fields Core reports', () => {
        const payload = PayloadClass.fromBuffer(Buffer.from(rawPayload));
        const json = payload.toJSON({ network });

        expect(json.version).to.equal(vector.core.version);
        expectLikeCore[vector.coreKey](payload, json, vector.core);
      });

      it('should restore the same bytes from JSON', () => {
        const json = JSON.parse(JSON.stringify(transaction.extraPayload.toJSON({ network })));

        expect(PayloadClass.fromJSON(json).toBuffer()).to.deep.equal(rawPayload);
      });

      it('should restore the same transaction from its object form', () => {
        const object = JSON.parse(JSON.stringify(transaction.toObject()));
        const restored = new Transaction(object);

        expect(restored.toString()).to.equal(vector.hex);
        expect(restored.hash).to.equal(vector.txid);
      });
    });
  });

  fixtures.blocks.forEach((vector) => {
    it(`should parse and re-serialize devnet block ${vector.height} with its ProTx`, () => {
      const block = new Block(Buffer.from(vector.hex, 'hex'));

      expect(block.toBuffer().toString('hex')).to.equal(vector.hex);
      expect(block.validMerkleRoot()).to.equal(true);
      expect(block.transactions.map((transaction) => transaction.hash)).to.include(vector.protxTxid);
    });
  });
});
