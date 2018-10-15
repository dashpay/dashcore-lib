var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var BufferUtil = DashcoreLib.util.buffer;
var Payload = DashcoreLib.Transaction.Payload;
var ProUpRevTxPayload = Payload.ProUpRevTxPayload;

var validProUpRevTxPayloadJSON = {
  version: 1,
  proTXHash: '0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4',
  reason: 1,
  inputsHash: 'a6f7b4284fb753eab9b554283c4fe1f1d7e143e6cf3b975d0376d7c08ba4cdf5',
  payloadSig: '48d6a1bd2cd9eec54eb866fc71209418a950402b5d7e52363bfb75c98e141175',
}

// TODO: The following need to be correctly defined
var validProUpRevTxPayloadHexString = '01000ef786b05e3070a5ff3c07dd393463653846ff6c354345059004762fb30e040100004f422948637072af5cdc211bb30fe96386c4935f64da82e6a855c6c9f3b377084120fd80034be1b0a94ecf7518eae71435b7774f3862f9e3a544848e2a24048043a33929089a0a871a17bbeb794c1153ed371eecbffd6d346e543a02fce734a059d3';
var validProUpRevTxPayloadBuffer = Buffer.from(validProUpRevTxPayloadHexString, 'hex');
var validProUpRevTxPayload = ProUpRevTxPayload.fromBuffer(validProUpRevTxPayloadBuffer);
var validProUpRevTxHash = 'a64e3e06c71873aff149c446d76618efad9a5908007886f6024e9fddb3e6aa13';

describe('ProUpRevTxPayload', function () {
  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProUpRevTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProUpRevTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProUpRevTxPayload and call #validate on it', function() {
      // TODO: Is there supposed to be logic here to test that validate is called?
      var payload = ProUpRevTxPayload.fromBuffer(Buffer.from(validProUpRevTxPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payload.reason).to.be.equal(1);
      expect(payload.inputsHash).to.be.equal('887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c');
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

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payload.reason).to.be.equal(1);
      expect(payload.inputsHash).to.be.equal('887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c');
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

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(payloadJSON.reason).to.be.equal(1);
      expect(payloadJSON.inputsHash).to.be.equal('887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c');
    });

    it('Should call #validate', function () {
      var payload = ProUpRevTxPayload.fromJSON(validProUpRevTxPayloadJSON);
      ProUpRevTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
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

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.proTXHash).to.be.equal(validProUpRevTxPayloadJSON.proTXHash);
      expect(restoredPayload.reason).to.be.equal(1);
      expect(restoredPayload.inputsHash).to.be.equal('887c37ba2939057858c340d231185ce2e70e66e1615d3165b1efa6854a10628c');
    });

    it('Should call #validate', function () {
      var payload = ProUpRevTxPayload.fromJSON(validProUpRevTxPayloadJSON);
      ProUpRevTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
