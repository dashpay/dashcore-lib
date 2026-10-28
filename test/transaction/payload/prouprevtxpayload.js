/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');

var proUpRevTxFixture = require('../../fixtures/payload/prouprevtxpayload');

var Payload = DashcoreLib.Transaction.Payload;
var ProUpRevTxPayload = Payload.ProUpRevTxPayload;

describe('ProUpRevTxPayload', function () {
  beforeEach(function () {
    sinon.spy(ProUpRevTxPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProUpRevTxPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProUpRevTxPayload and call #validate on it', function () {
      ProUpRevTxPayload.prototype.validate.resetHistory();
      var payload = ProUpRevTxPayload.fromBuffer(
        proUpRevTxFixture.getProUpRevPayloadBuffer()
      );
      expect(payload.validate.callCount).to.be.equal(1);

      var payloadJSON = payload.toJSON({ skipSignature: true });
      expect(payloadJSON).to.be.deep.equal(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );
    });

    it('Should throw an error when there is unexpected information in the raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proUpRevTxFixture.getProUpRevPayloadHex() + '0000',
        'hex'
      );

      expect(function () {
        ProUpRevTxPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProUpRevTxPayload and call #validate on it', function () {
      var payload = ProUpRevTxPayload.fromJSON(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );

      expect(payload.toJSON()).to.be.deep.equal(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProUpRevTxPayload.fromBuffer(
        proUpRevTxFixture.getProUpRevPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({ skipSignature: true });

      expect(payloadJSON).to.be.deep.equal(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );

      var payloadWithSig = payload.toJSON();
      var restoredBuffer = ProUpRevTxPayload.fromJSON(payloadWithSig);
      expect(restoredBuffer.toString('hex')).to.be.equal(
        proUpRevTxFixture.getProUpRevPayloadHex()
      );
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var payload = ProUpRevTxPayload.fromBuffer(
        proUpRevTxFixture.getProUpRevPayloadBuffer()
      );

      var serializedPayload = payload.toBuffer();
      expect(serializedPayload.toString('hex')).to.be.equal(
        proUpRevTxFixture.getProUpRevPayloadHex()
      );

      var restoredPayload = ProUpRevTxPayload.fromBuffer(serializedPayload);
      expect(restoredPayload.toJSON({ skipSignature: true })).to.be.deep.equal(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );
    });

    it('Should call #validate', function () {
      var payload = ProUpRevTxPayload.fromJSON(
        proUpRevTxFixture.getProUpRevPayloadJSON()
      );
      ProUpRevTxPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#validate', function () {
    var vector = require('../../fixtures/core24-protx.json').transactions.find(
      function (v) {
        return v.name === 'v3 ProUpRevTx';
      }
    );

    it('Should reject an unknown version while parsing', function () {
      var raw = Buffer.from(new DashcoreLib.Transaction(vector.hex).extraPayload.toBuffer());
      [0, 4].forEach(function (version) {
        raw.writeUInt16LE(version, 0);
        expect(function () {
          ProUpRevTxPayload.fromBuffer(raw);
        }).to.throw('Expect version to be an integer from 1 to 3');
      });
    });

    it('Should require a reason from 0 to 3', function () {
      var payload = new DashcoreLib.Transaction(vector.hex).extraPayload;
      payload.reason = 3;
      payload.validate();
      payload.reason = 4;
      expect(function () {
        payload.validate();
      }).to.throw('Expected reason to be an integer from 0 to 3');
    });

    it('Should require a version from 1 to 3', function () {
      var payload = new DashcoreLib.Transaction(vector.hex).extraPayload;
      payload.validate();
      [0, 4].forEach(function (version) {
        payload.version = version;
        expect(function () {
          payload.validate();
        }).to.throw('Expect version to be an integer from 1 to 3');
      });
    });
  });
});
