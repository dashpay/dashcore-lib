var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

var merkleRootMNList = 'e83c76065797d4542f1cd02e00d02093bea6fb53f5ad6aaa160fd3ccb30001b9';
console.log(merkleRootMNList);

var validProTxUpServPayloadJSON = {
  version: 1,
  proTXHash: 'c571c3168c77d7b91e647d532da46d8a8fc9d5b4b1a4806acd0cf15e09d347da',
  port: 19999,
  ipAddress: '00000000000000000000ffffc38d8f31',
  inputsHash: '0a816f69b6458351b2449455a43cb77c0aa980e3a6c6f982dc1d9cde79201d20',
  //address: 'yTSw4medvYq3nPWHdC9nQ1DtSRCnJUdJ4T'
  scriptOperatorPayout: ''
};
var validProTxUpServPayloadHexString = '0100da47d3095ef10ccd6a80a4b1b4d5c98f8a6da42d537d641eb9d7778c16c371c500000000000000000000ffffc38d8f314e1f00201d2079de9c1ddc82f9c6a6e380a90a7cb73ca4559444b2518345b6696f810a951c228f519ba2cb6d542d85d76e8b8390d12e03df608ff0c79d08489ac52ed62e076642f31b7e0bfcf21ec927ecdb2718ad3e7f7b41db8c627c89ab40a0b45020ed0743a954740352a14e2869f0c7fd14c7cb9de7cc65850247ea59f487c779';
var validProTxUpServPayloadBuffer = Buffer.from(validProTxUpServPayloadHexString, 'hex');
var validProTxUpServPayload = ProTxUpServPayload.fromBuffer(validProTxUpServPayloadBuffer);

describe('ProTxUpServPayload', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should return instance of ProTxUpServPayload and call #validate on it', function() {
      var payload = ProTxUpServPayload.fromBuffer(Buffer.from(validProTxUpServPayloadHexString, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('c571c3168c77d7b91e647d532da46d8a8fc9d5b4b1a4806acd0cf15e09d347da');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('0a816f69b6458351b2449455a43cb77c0aa980e3a6c6f982dc1d9cde79201d20');
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('');
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProTxUpServPayloadHexString + '0000', 'hex');

      expect(function() {
        ProTxUpServPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    it('Should return instance of ProTxUpServPayload and call #validate on it', function() {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);

      expect(payload.version).to.be.equal(1);
      expect(payload.proTXHash).to.be.equal('c571c3168c77d7b91e647d532da46d8a8fc9d5b4b1a4806acd0cf15e09d347da');
      // 1.2.3.6 mapped to IPv6
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('0a816f69b6458351b2449455a43cb77c0aa980e3a6c6f982dc1d9cde79201d20');
      expect(new Script(payload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('');
    });

    after(function () {
      ProTxUpServPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProTxUpServPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      expect(payloadJSON.proTXHash).to.be.equal('c571c3168c77d7b91e647d532da46d8a8fc9d5b4b1a4806acd0cf15e09d347da');
      // 1.2.3.6 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payloadJSON.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('0a816f69b6458351b2449455a43cb77c0aa980e3a6c6f982dc1d9cde79201d20');
      expect(new Script(payloadJSON.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('');
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProTxUpServPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProTxUpServPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProTxUpServPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProTxUpServPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      expect(restoredPayload.proTXHash).to.be.equal('c571c3168c77d7b91e647d532da46d8a8fc9d5b4b1a4806acd0cf15e09d347da');
      // 1.2.3.6 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(restoredPayload.port).to.be.equal(19999);
      expect(payload.inputsHash).to.be.equal('0a816f69b6458351b2449455a43cb77c0aa980e3a6c6f982dc1d9cde79201d20');
      expect(new Script(restoredPayload.scriptOperatorPayout).toAddress('testnet').toString()).to.be.equal('');
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(validProTxUpServPayloadJSON);
      ProTxUpServPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});
