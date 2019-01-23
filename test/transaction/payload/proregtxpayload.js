/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var proRegTxFixture = require('../../fixtures/payload/proregtxpayload');

var DashcoreLib = require('../../../index');

var ProRegTxPayload = DashcoreLib.Transaction.Payload.ProRegTxPayload;

describe('ProRegTxPayload', function () {
  beforeEach(function () {
    sinon.spy(ProRegTxPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProRegTxPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProRegTxPayload and call #validate on it', function () {
      var payload = ProRegTxPayload.fromBuffer(proRegTxFixture.getProRegTxBuffer());

      expect(payload.toJSON({
        network: 'testnet',
        skipSignature: true
      })).to.be.deep.equal(proRegTxFixture.getProRegTxJSON());
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(proRegTxFixture.getProRegTxHex() + '0000', 'hex');

      expect(function () {
        ProRegTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProRegTxPayload and call #validate on it', function () {
      var payload = ProRegTxPayload.fromJSON(proRegTxFixture.getProRegTxJSON());
      var restoredJSON = payload.toJSON({network: 'testnet'});

      expect(restoredJSON).to.be.deep.equal(proRegTxFixture.getProRegTxJSON());
    });
  });

  describe('.toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProRegTxPayload.fromBuffer(proRegTxFixture.getProRegTxBuffer());

      var payloadJSON = payload.toJSON({network: 'testnet', skipSignature: true});
      expect(payloadJSON).to.be.deep.equal(proRegTxFixture.getProRegTxJSON());

      var restoredPayloadHex = ProRegTxPayload.fromJSON(payload.toJSON()).toBuffer().toString('hex');
      expect(restoredPayloadHex).to.be.equal(proRegTxFixture.getProRegTxHex());
    });

    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(proRegTxFixture.getProRegTxJSON());
      ProRegTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('.toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var restoredPayload = ProRegTxPayload.fromBuffer(Buffer.from(proRegTxFixture.getProRegTxHex(), 'hex'));

      expect(restoredPayload.toBuffer().toString('hex')).to.be.equal(proRegTxFixture.getProRegTxHex());
    });

    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(proRegTxFixture.getProRegTxJSON());
      ProRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
