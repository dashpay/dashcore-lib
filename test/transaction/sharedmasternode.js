const { expect } = require('chai');
const DashcoreLib = require('../..');

const fixtures = require('../fixtures/core24-shared-masternode.json');

const { Block, Transaction } = DashcoreLib;
const { Payload } = Transaction;

const payloadClasses = {
  10: Payload.ProDisTxPayload,
  11: Payload.ProUpShareTxPayload,
  12: Payload.ProUpSharedRegTxPayload,
};

describe('Shared masternode special transactions (Core V24)', () => {
  it('should register the transaction types', () => {
    expect(Transaction.TYPES.TRANSACTION_PROVIDER_DISSOLVE).to.equal(10);
    expect(Transaction.TYPES.TRANSACTION_PROVIDER_UPDATE_SHARE).to.equal(11);
    expect(
      Transaction.TYPES.TRANSACTION_PROVIDER_UPDATE_SHARED_REGISTRAR
    ).to.equal(12);
    Object.keys(payloadClasses).forEach((type) => {
      expect(Payload.create(Number(type))).to.be.an.instanceOf(
        payloadClasses[type]
      );
    });
  });

  fixtures.transactions.forEach((vector) => {
    it(`should round-trip the ${vector.description} with the Core txid`, () => {
      const tx = new Transaction(vector.hex);
      expect(tx.type).to.equal(vector.type);
      expect(tx.extraPayload).to.be.an.instanceOf(payloadClasses[vector.type]);
      expect(tx.extraPayload.toBuffer().toString('hex')).to.equal(
        vector.extraPayload
      );
      expect(tx.toString()).to.equal(vector.hex);
      expect(tx.hash).to.equal(vector.txid);
      expect(new Transaction(tx.toObject()).toString()).to.equal(vector.hex);
      expect(
        new Transaction(JSON.parse(JSON.stringify(tx.toJSON()))).toString()
      ).to.equal(vector.hex);
    });
  });

  it(`should reject a ${fixtures.truncatedProDisTx.description}`, () => {
    expect(() => new Transaction(fixtures.truncatedProDisTx.hex)).to.throw(
      'expected 65 more bytes, found 64'
    );
  });

  fixtures.blocks.forEach((vector) => {
    it(`should parse and re-serialize a ${vector.description}`, () => {
      const block = Block.fromString(vector.hex);
      expect(block.hash).to.equal(vector.hash);
      expect(block.validMerkleRoot()).to.equal(true);
      expect(block.toString()).to.equal(vector.hex);
      block.transactions.slice(1).forEach((tx) => {
        expect(tx.extraPayload).to.be.an.instanceOf(payloadClasses[tx.type]);
      });
    });
  });
});
