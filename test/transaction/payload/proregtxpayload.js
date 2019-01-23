/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var ProRegTxPayload = DashcoreLib.Transaction.Payload.ProRegTxPayload;

var validProRegTxPayloadJSON = {
    "version": 1,
    "collateralHash": "a65693797d7137a2529f438807a8c7c085d3984ceaa2f4f5230a36b536cbd326",
    "collateralIndex": 1,
    "service": "195.141.0.143:19999",
    "keyIDOwner": "3c05fb32367a25d8dedc16f741b8492006fb948a",
    "pubKeyOperator": "8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b",
    "keyIDVoting": "3c05fb32367a25d8dedc16f741b8492006fb948a",
    "payoutAddress": "yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH",
    "operatorReward": 0,
    "inputsHash": "0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc"
};

var validProRegTxPayloadJSONwitoutCollateral = {
  version : 1,
  type: 0,
  mode: 0,
  collateralHash: '0000000000000000000000000000000000000000000000000000000000000000',
  collateralIndex: 1,
  ipAddress : '00000000000000000000ffffc38d8f31',
  port : 19999,
  keyIdOwner : '637139637672d2118ae68e6b7eaae15aea2f0b14',
  keyIdOperator : '18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda',
  keyIdVoting : '428c680677c45b1c2a50a2cca57e0ad0409f5d59',
  operatorReward : 1100,
  scriptPayout : '76a914c0ee80d8e78d59877e5ca6fa6d071f2bbf3037e688ac',
  inputsHash : '8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f',
  payloadSigSize : 0,
  payloadSig: undefined
};

var validProRegTxPayloadHexString = '01000000000026d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a60100000000000000000000000000ffffc38d008f4e1f8a94fb062049b841f716dcded8257a3632fb053c8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b8a94fb062049b841f716dcded8257a3632fb053c00001976a914e4876df5735eaa10a761dca8d62a7a275349022188acbc1055e0331ea0ea63caf80e0a7f417e50df6469a97db1f4f1d81990316a5e0b412045323bca7defef188065a6b30fb3057e4978b4f914e4e8cc0324098ae60ff825693095b927cd9707fe10edbf8ef901fcbc63eb9a0e7cd6fed39d50a8cde1cdb4';
var validProRegTxPayloadHexStringwitoutCollateral = '01000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000ffffc38d8f314e1f140b2fea5ae1aa7e6b8ee68a11d272766339716318ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda595d9f40d00a7ea5cca2502a1c5bc47706688c424c041976a914c0ee80d8e78d59877e5ca6fa6d071f2bbf3037e688ac8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f00';

var validProRegTxPayloadBuffer = Buffer.from(validProRegTxPayloadHexString, 'hex');
var validProRegTxPayload = ProRegTxPayload.fromBuffer(validProRegTxPayloadBuffer);
var validProRegTxPayloadBufferwithoutCollateral = Buffer.from(validProRegTxPayloadHexStringwitoutCollateral, 'hex');
var validProRegTxPayloadwithoutCollateral = ProRegTxPayload.fromBuffer(validProRegTxPayloadBufferwithoutCollateral);

describe('ProRegTxPayload with collateral', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromBuffer(Buffer.from(validProRegTxPayloadHexString, 'hex'));

      expect(payload.toJSON({
          network: 'testnet',
          skipSignature: true
      })).to.be.deep.equal(validProRegTxPayloadJSON);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProRegTxPayloadHexString + '0000', 'hex');

      expect(function() {
        ProRegTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);

      expect(payload.toJSON()).to.be.deep.equal(validProRegTxPayloadJSON);
    });

    after(function () {
      ProRegTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProRegTxPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffff12ca34aa');
      expect(payloadJSON.port).to.be.equal(35015);
      expect(payloadJSON.collateralHash).to.be.equal('03b10d11e2196319c5632d22dd460b3a31d5fef7c024e2d278e1bbc01661fdef');
      expect(payloadJSON.collateralIndex).to.be.equal(16);

      expect(payloadJSON.keyIdOwner).to.be.equal('9b53742c3abffa67191269b550ab40d619f0259f');
      expect(payloadJSON.keyIdOperator).to.be.equal('15ddc5d0053e2f3a2e70dbb1808ec60844ac4c8ba5fac73c9b6abbab23ef09df0d2347f2a3182eabead0027a2137e59c');
      expect(payloadJSON.keyIdVoting).to.be.equal('9b53742c3abffa67191269b550ab40d619f0259f');

      expect(new Script(payloadJSON.scriptPayout).toAddress('testnet').toString()).to.be.equal('ygbk1qkuT6ReoNMcYUQokjj6aTEyDHpjSQ');

      expect(payloadJSON.operatorReward).to.be.equal(201);
      expect(payloadJSON.inputsHash).to.be.equal('991c137dc07e13f02e188b2f97725f0f4487a0cd502ac8eb3fbc88e3c2f0d4ca');
      expect(payloadJSON.payloadSig).to.be.equal('1fe30ecf9cc167ff85f7d73efe9506de44762447063a62fbe82f19af39d6a353734ad0cd835d6b38cbe5a965b27a2be353ebe4a6a08e50510027c484ba74c4734c');

    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);
      ProRegTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProRegTxPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProRegTxPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffff12ca34aa');
      expect(restoredPayload.port).to.be.equal(35015);
      expect(restoredPayload.collateralHash).to.be.equal('03b10d11e2196319c5632d22dd460b3a31d5fef7c024e2d278e1bbc01661fdef');
      expect(restoredPayload.collateralIndex).to.be.equal(16);

      expect(restoredPayload.keyIdOwner).to.be.equal('9b53742c3abffa67191269b550ab40d619f0259f');
      expect(restoredPayload.keyIdOperator).to.be.equal('15ddc5d0053e2f3a2e70dbb1808ec60844ac4c8ba5fac73c9b6abbab23ef09df0d2347f2a3182eabead0027a2137e59c');
      expect(restoredPayload.keyIdVoting).to.be.equal('9b53742c3abffa67191269b550ab40d619f0259f');

      expect(new Script(restoredPayload.scriptPayout).toAddress('testnet').toString()).to.be.equal('ygbk1qkuT6ReoNMcYUQokjj6aTEyDHpjSQ');

      expect(restoredPayload.operatorReward).to.be.equal(201);
      expect(restoredPayload.inputsHash).to.be.equal('991c137dc07e13f02e188b2f97725f0f4487a0cd502ac8eb3fbc88e3c2f0d4ca');

      expect(restoredPayload.payloadSig).to.be.equal('1fe30ecf9cc167ff85f7d73efe9506de44762447063a62fbe82f19af39d6a353734ad0cd835d6b38cbe5a965b27a2be353ebe4a6a08e50510027c484ba74c4734c');

      expect(restoredPayload.toBuffer().toString('hex')).to.be.equal(validProRegTxPayloadHexString);
    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSON);
      ProRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});

describe('ProRegTxPayload without collateral', function () {

  describe('.fromBuffer', function () {

    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromBuffer(Buffer.from(validProRegTxPayloadHexStringwitoutCollateral, 'hex'));

      expect(payload.version).to.be.equal(1);
      expect(payload.type).to.be.equal(0);
      expect(payload.mode).to.be.equal(0);
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);
      expect(payload.collateralHash).to.be.equal('0000000000000000000000000000000000000000000000000000000000000000');
      expect(payload.collateralIndex).to.be.equal(1);

      expect(payload.keyIdOwner).to.be.equal('637139637672d2118ae68e6b7eaae15aea2f0b14');
      expect(payload.keyIdOperator).to.be.equal('18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda');
      expect(payload.keyIdVoting).to.be.equal('428c680677c45b1c2a50a2cca57e0ad0409f5d59');

      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yduaJXyuHPfCGqqT9ap9n9fQTQ7ZrXNTeC');

      expect(payload.operatorReward).to.be.equal(1100);
      expect(payload.inputsHash).to.be.equal('8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f');
      expect(payload.payloadSig).to.be.equal(undefined);
      // TODO: Add signature verification
    });

    it('Should throw in case if there is some unexpected information in raw payload', function() {
      var payloadWithAdditionalZeros = Buffer.from(validProRegTxPayloadHexStringwitoutCollateral + '0000', 'hex');

      expect(function() {
        ProRegTxPayload.fromBuffer(payloadWithAdditionalZeros)
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

  });

  describe('.fromJSON', function () {
    before(function() {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    it('Should return instance of ProRegTxPayload and call #validate on it', function() {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSONwitoutCollateral);
      expect(payload.version).to.be.equal(1);
      expect(payload.type).to.be.equal(0);
      expect(payload.mode).to.be.equal(0);
      expect(payload.collateralHash).to.be.equal('0000000000000000000000000000000000000000000000000000000000000000');
      expect(payload.collateralIndex).to.be.equal(1);
      expect(payload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payload.port).to.be.equal(19999);

      expect(payload.keyIdOwner).to.be.equal('637139637672d2118ae68e6b7eaae15aea2f0b14');
      expect(payload.keyIdOperator).to.be.equal('18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda');
      expect(payload.keyIdVoting).to.be.equal('428c680677c45b1c2a50a2cca57e0ad0409f5d59');

      expect(new Script(payload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yduaJXyuHPfCGqqT9ap9n9fQTQ7ZrXNTeC');

      expect(payload.operatorReward).to.be.equal(1100);
      expect(payload.inputsHash).to.be.equal('8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f');
      expect(payload.payloadSig).to.be.equal(undefined);
      // TODO: Add signature verification
    });

    after(function () {
      ProRegTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validProRegTxPayloadwithoutCollateral.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(payloadJSON.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(payloadJSON.port).to.be.equal(19999);
      expect(payloadJSON.collateralHash).to.be.equal('0000000000000000000000000000000000000000000000000000000000000000');
      expect(payloadJSON.collateralIndex).to.be.equal(1);

      expect(payloadJSON.keyIdOwner).to.be.equal('637139637672d2118ae68e6b7eaae15aea2f0b14');
      expect(payloadJSON.keyIdOperator).to.be.equal('18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda');
      expect(payloadJSON.keyIdVoting).to.be.equal('428c680677c45b1c2a50a2cca57e0ad0409f5d59');

      expect(new Script(payloadJSON.scriptPayout).toAddress('testnet').toString()).to.be.equal('yduaJXyuHPfCGqqT9ap9n9fQTQ7ZrXNTeC');

      expect(payloadJSON.operatorReward).to.be.equal(1100);
      expect(payloadJSON.inputsHash).to.be.equal('8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f');
      expect(payloadJSON.payloadSig).to.be.equal(undefined);

    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSONwitoutCollateral);
      ProRegTxPayload.prototype.validate.reset();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(ProRegTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      ProRegTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validProRegTxPayloadwithoutCollateral.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = ProRegTxPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(1);
      // 1.2.3.7 mapped to IPv6
      expect(restoredPayload.ipAddress).to.be.equal('00000000000000000000ffffc38d8f31');
      expect(restoredPayload.port).to.be.equal(19999);
      expect(restoredPayload.collateralHash).to.be.equal('0000000000000000000000000000000000000000000000000000000000000000');
      expect(restoredPayload.collateralIndex).to.be.equal(1);

      expect(restoredPayload.keyIdOwner).to.be.equal('637139637672d2118ae68e6b7eaae15aea2f0b14');
      expect(restoredPayload.keyIdOperator).to.be.equal('18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda');
      expect(restoredPayload.keyIdVoting).to.be.equal('428c680677c45b1c2a50a2cca57e0ad0409f5d59');

      expect(new Script(restoredPayload.scriptPayout).toAddress('testnet').toString()).to.be.equal('yduaJXyuHPfCGqqT9ap9n9fQTQ7ZrXNTeC');

      expect(restoredPayload.operatorReward).to.be.equal(1100);
      expect(restoredPayload.inputsHash).to.be.equal('8e534b752f2a6ab10990caef7fe2ff552bbeadd9e28b99e47e21e69cd22fc78f');

      expect(restoredPayload.payloadSig).to.be.equal(undefined);

      expect(restoredPayload.toBuffer().toString('hex')).to.be.equal(validProRegTxPayloadHexStringwitoutCollateral);
    });
    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(validProRegTxPayloadJSONwitoutCollateral);
      ProRegTxPayload.prototype.validate.reset();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

});
