/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var DashcoreLib = require('../..');

var fixtures = require('../fixtures/core24-shared-masternode.json');

var Block = DashcoreLib.Block;
var Transaction = DashcoreLib.Transaction;
var Payload = Transaction.Payload;

var payloadClasses = {
  10: Payload.ProDisTxPayload,
  11: Payload.ProUpShareTxPayload,
  12: Payload.ProUpSharedRegTxPayload,
};

describe('Shared masternode special transactions (Core V24)', function () {
  it('should register the transaction types', function () {
    expect(Transaction.TYPES.TRANSACTION_PROVIDER_DISSOLVE).to.equal(10);
    expect(Transaction.TYPES.TRANSACTION_PROVIDER_UPDATE_SHARE).to.equal(11);
    expect(
      Transaction.TYPES.TRANSACTION_PROVIDER_UPDATE_SHARED_REGISTRAR
    ).to.equal(12);
    Object.keys(payloadClasses).forEach(function (type) {
      expect(Payload.create(Number(type))).to.be.an.instanceOf(
        payloadClasses[type]
      );
    });
  });

  fixtures.transactions.forEach(function (vector) {
    it('should round-trip the ' + vector.description + ' with the Core txid', function () {
      var tx = new Transaction(vector.hex);
      expect(tx.type).to.equal(vector.type);
      expect(tx.extraPayload).to.be.an.instanceOf(payloadClasses[vector.type]);
      expect(tx.extraPayload.toBuffer().toString('hex')).to.equal(vector.extraPayload);
      expect(tx.toString()).to.equal(vector.hex);
      expect(tx.hash).to.equal(vector.txid);
      expect(new Transaction(tx.toObject()).toString()).to.equal(vector.hex);
      expect(
        new Transaction(JSON.parse(JSON.stringify(tx.toJSON()))).toString()
      ).to.equal(vector.hex);
    });
  });

  it('should reject a ' + fixtures.truncatedProDisTx.description, function () {
    expect(function () {
      return new Transaction(fixtures.truncatedProDisTx.hex);
    }).to.throw('Expected each payloadSig');
  });

  fixtures.blocks.forEach(function (vector) {
    it('should parse and re-serialize a ' + vector.description, function () {
      var block = Block.fromString(vector.hex);
      expect(block.hash).to.equal(vector.hash);
      expect(block.validMerkleRoot()).to.be.true;
      expect(block.toString()).to.equal(vector.hex);
      block.transactions.slice(1).forEach(function (tx) {
        expect(tx.extraPayload).to.be.an.instanceOf(payloadClasses[tx.type]);
      });
    });
  });
});
