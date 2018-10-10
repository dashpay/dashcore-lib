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
var validProUpRevTxPayloadHexString = '0100a45f4e6af45dfc15d44147ec6e5ab0d8d2048ea2e95e2820f7cdfd1c1b9175094312010000000000000000000000ffff0102030604d41976a9148603df234fe8f26064439de60ed13eb92d76cc5588ac8c62104a85a6efb165315d61e1660ee7e25c1831d240c35878053929ba377c88411fdaf84b78552f91c99eb267efec1be0e63b7459e66f142daabb0345477842592b68ce0f59b163657c480061fe834a888f9a9697e7635b36b4ede84a2374ad9831';
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
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
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
      expect(payload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
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
      expect(payloadJSON.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
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
      expect(restoredPayload.proTXHash).to.be.equal('0975911b1cfdcdf720285ee9a28e04d2d8b05a6eec4741d415fc5df46a4e5fa4');
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
