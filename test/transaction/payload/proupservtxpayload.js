/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');
var proUpServTxFixture = require('../../fixtures/payload/proupservpayload');

var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

describe('ProTxUpServPayload', function () {
  beforeEach(function () {
    sinon.spy(ProTxUpServPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProTxUpServPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProTxUpServPayload and call #validate on it', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      expect(
        payload.toJSON({
          skipSignature: true,
          network: 'testnet',
        })
      ).to.be.deep.equal(proUpServTxFixture.getProUpServPayloadJSON());
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proUpServTxFixture.getProUpServPayloadHex() + '0000',
        'hex'
      );

      expect(function () {
        ProTxUpServPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProTxUpServPayload and call #validate on it', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );

      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({
        network: 'testnet',
        skipSignature: true,
      });

      expect(payloadJSON).to.be.deep.equal(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
      ProTxUpServPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      expect(payload.toBuffer().toString('hex')).to.be.equal(
        proUpServTxFixture.getProUpServPayloadHex()
      );
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
      ProTxUpServPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('operator payout', function () {
    it('Should leave out the operator payout address when there is none', function () {
      var json = proUpServTxFixture.getProUpServPayloadJSON();
      delete json.operatorPayoutAddress;

      var payload = ProTxUpServPayload.fromJSON(json);
      var restored = ProTxUpServPayload.fromJSON(
        payload.toJSON({ network: 'testnet' })
      );

      expect(payload.scriptOperatorPayout).to.be.equal('');
      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(json);
      expect(restored.toBuffer()).to.be.deep.equal(payload.toBuffer());
    });
  });

  describe('version 3 (ExtAddr)', function () {
    var vectors = require('../../fixtures/core24-protx.json').transactions;

    it('Should require addresses that can be serialized', function () {
      var vector = vectors.find(function (v) {
        return v.name === 'v3 evonode ProUpServTx';
      });
      var payload = new DashcoreLib.Transaction(vector.hex).extraPayload;
      payload.addresses = { core_p2p: ['1.2.3.4:9999'], unknown: [] };

      expect(function () {
        payload.validate();
      }).to.throw('Unknown address purpose unknown');
    });
  });
});
