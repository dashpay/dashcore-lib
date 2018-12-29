/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRevTxPayload = Payload.ProUpRevTxPayload;

var validProUpRevTxPayloadJSON = {
  version: 1,
  proTXHash: '1659e06c825212c9b11325760a18f6ea06194ec4efd603f03d8704f23d818a6f',
  reason: 1,
  inputsHash: '82cf248cf6b8ac6a3cdc826edae582ead20421659ed891f9d4953a540616fb4f',
  payloadSig: '05279584b3339ed2ba95711ad28b18ee2878c4a904f76ea4d103e1d739f22ff7e3b9b3db7d0c4a7e120abb4952c3574a18de34fa29828f9fe3f52bd0b1fac17acd04f7751967d782045ab655053653438f1dd1e14ba6adeb8351b78c9eb59bf4',
}

var validProUpRevTxPayloadHexString = '01006f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce05916010082cf248cf6b8ac6a3cdc826edae582ead20421659ed891f9d4953a540616fb4f05279584b3339ed2ba95711ad28b18ee2878c4a904f76ea4d103e1d739f22ff7e3b9b3db7d0c4a7e120abb4952c3574a18de34fa29828f9fe3f52bd0b1fac17acd04f7751967d782045ab655053653438f1dd1e14ba6adeb8351b78c9eb59bf4';
var validProUpRevTxPayloadBuffer = Buffer.from(validProUpRevTxPayloadHexString, 'hex');
var validProUpRevTxPayload = ProUpRevTxPayload.fromBuffer(validProUpRevTxPayloadBuffer);

describe('ProUpRevTxPayload', function () {
  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProUpRevTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRevTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProUpRevTxPayload and call #validate on it', function() {
      ProUpRevTxPayload.prototype.validate.reset();
      var payload = ProUpRevTxPayload.fromBuffer(Buffer.from(validProUpRevTxPayloadHexString, 'hex'));
      expect(payload.validate.callCount).to.be.equal(1);

      var json = payload.toJSON();
      expect(payload.version).to.be.equal(validProUpRevTxPayloadJSON.version);
      expect(payload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payload.reason).to.be.equal(validProUpRevTxPayloadJSON.reason);
      expect(payload.inputsHash).to.be.equal(validProUpRevTxPayloadJSON.inputsHash);
      expect(payload.payloadSig).to.be.equal(validProUpRevTxPayloadJSON.payloadSig);

    });

    it('Should throw an error when there is unexpected information in the raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProUpRevTxPayloadHexString + '0000', 'hex');

      expect(function() {
        ProUpRevTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProUpRevTxPayload.prototype, 'validate');
    });

    it('Should return instance of ProUpRevTxPayload and call #validate on it', function() {
      var payload = ProUpRevTxPayload.fromJSON(validProUpRevTxPayloadJSON);

      expect(payload.version).to.be.equal(validProUpRevTxPayloadJSON.version);
      expect(payload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payload.reason).to.be.equal(validProUpRevTxPayloadJSON.reason);
      expect(payload.inputsHash).to.be.equal(validProUpRevTxPayloadJSON.inputsHash);
      expect(payload.payloadSig).to.be.equal(validProUpRevTxPayloadJSON.payloadSig);
    });

    after(function () {
      ProUpRevTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProUpRevTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRevTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProUpRevTxPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(validProUpRevTxPayloadJSON.version);
      expect(payloadJSON.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payloadJSON.reason).to.be.equal(validProUpRevTxPayloadJSON.reason);
      expect(payloadJSON.inputsHash).to.be.equal(validProUpRevTxPayloadJSON.inputsHash);
      expect(payloadJSON.payloadSig).to.be.equal(validProUpRevTxPayloadJSON.payloadSig);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProUpRevTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRevTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProUpRevTxPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProUpRevTxPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(validProUpRevTxPayloadJSON.version);
      expect(restoredPayload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(restoredPayload.reason).to.be.equal(validProUpRevTxPayloadJSON.reason);
      expect(restoredPayload.inputsHash).to.be.equal(validProUpRevTxPayloadJSON.inputsHash);
      expect(restoredPayload.payloadSig).to.be.equal(validProUpRevTxPayloadJSON.payloadSig);
    });

    it('Should call #validate', function () {
      var payload = ProUpRevTxPayload.fromJSON(validProUpRevTxPayloadJSON);
      ProUpRevTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
