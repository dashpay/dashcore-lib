/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');
var proUpRegTxFixture = require('../../fixtures/payload/proupregtxpayload');

var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

describe('ProUpRegTxPayload', function () {
  beforeEach(function () {
    sinon.spy(ProUpRegTxPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProUpRegTxPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProUpRegTxPayload and call #validate on it', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );
      expect(payload.validate.callCount).to.be.equal(1);

      expect(
        payload.toJSON({
          network: 'testnet',
          skipSignature: true,
        })
      ).to.be.deep.equal(proUpRegTxFixture.getProUpRegPayloadJSON());
    });

    it('Should throw an error when there is unexpected information in the raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proUpRegTxFixture.getProUpRegPayloadHex() + '0000',
        'hex'
      );
      expect(function () {
        ProUpRegTxPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProUpRegTxPayload and call #validate on it', function () {
      var payload = ProUpRegTxPayload.fromJSON(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );

      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({
        network: 'testnet',
        skipSignature: true,
      });

      expect(payloadJSON).to.be.deep.equal(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );

      var restoredBuffer = ProUpRegTxPayload.fromJSON(
        payload.toJSON()
      ).toBuffer();
      expect(restoredBuffer.toString('hex')).to.be.equal(
        proUpRegTxFixture.getProUpRegPayloadHex()
      );
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );

      var serializedPayload = payload.toBuffer();
      expect(serializedPayload.toString('hex')).to.be.equal(
        proUpRegTxFixture.getProUpRegPayloadHex()
      );
    });

    it('Should call #validate', function () {
      var payload = ProUpRegTxPayload.fromJSON(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );
      ProUpRegTxPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
