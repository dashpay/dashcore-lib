/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var DashcoreLib = require('../../..');

var fixtures = require('../../fixtures/core24-shared-masternode.json');

var Address = DashcoreLib.Address;
var PrivateKey = DashcoreLib.PrivateKey;
var Script = DashcoreLib.Script;
var ProUpShareTxPayload = DashcoreLib.Transaction.Payload.ProUpShareTxPayload;

var vectors = fixtures.transactions.filter(function (vector) {
  return vector.type === 11;
});

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProUpShareTxPayload', function () {
  var vector = vectors[0];
  var raw = Buffer.from(vector.extraPayload, 'hex');

  vectors.forEach(function (vector) {
    describe('Core vector: ' + vector.description, function () {
      var raw = Buffer.from(vector.extraPayload, 'hex');

      it('should parse the fields Core decodes', function () {
        var payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
        var json = payload.toJSON({ network: 'testnet' });
        expect(json.version).to.equal(vector.decoded.version);
        expect(json.proTxHash).to.equal(vector.decoded.proTxHash);
        expect(json.shareIndex).to.equal(vector.decoded.shareIndex);
        expect(json.rewardAddress).to.equal(vector.decoded.rewardAddress);
        expect(json.inputsHash).to.equal(vector.decoded.inputsHash);
        expect(payload.scriptReward).to.equal(
          Script.fromAddress(vector.decoded.rewardAddress).toHex()
        );
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', function () {
        var payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.toBuffer()).to.deep.equal(raw);
        expect(
          ProUpShareTxPayload.fromJSON(payload.toJSON({ network: 'testnet' })).toBuffer()
        ).to.deep.equal(raw);
        expect(payload.copy().toBuffer()).to.deep.equal(raw);
      });

      it('should verify the signature against the owner of the updated share', function () {
        var payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
        var owners = vector.shareOwnerAddresses;
        var shareIndex = vector.decoded.shareIndex;
        expect(payload.verifySignature(keyId(owners[shareIndex]))).to.be.true;
        expect(
          payload.verifySignature(keyId(owners[(shareIndex + 1) % owners.length]))
        ).to.be.false;
      });
    });
  });

  describe('serialization', function () {
    it('should omit the signature with skipSignature, as Core hashes the payload', function () {
      var payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
      var unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.deep.equal(raw.slice(0, raw.length - 66));
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property('payloadSig');
    });

    it('should serialize an unsigned payload with an empty signature', function () {
      var json = ProUpShareTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
        skipSignature: true,
      });
      var payload = ProUpShareTxPayload.fromJSON(json);
      var bytes = payload.toBuffer();
      expect(bytes).to.deep.equal(
        Buffer.concat([raw.slice(0, raw.length - 66), Buffer.from([0])])
      );
      expect(ProUpShareTxPayload.fromBuffer(bytes).payloadSig).to.be.undefined;
    });

    it('should throw when the raw payload has trailing bytes', function () {
      expect(function () {
        ProUpShareTxPayload.fromBuffer(Buffer.from(vector.extraPayload + '00', 'hex'));
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });
  });

  describe('#sign', function () {
    it('should sign the payload hash with the share owner key', function () {
      var key = new PrivateKey();
      var payload = ProUpShareTxPayload.fromJSON(
        ProUpShareTxPayload.fromBuffer(Buffer.from(raw)).toJSON({ skipSignature: true })
      );
      payload.sign(key);
      expect(payload.payloadSig).to.have.lengthOf(130);
      expect(payload.verifySignature(key.toAddress().hashBuffer)).to.be.true;
      var restored = ProUpShareTxPayload.fromBuffer(payload.toBuffer());
      expect(restored.verifySignature(key.toAddress().hashBuffer)).to.be.true;
    });
  });

  describe('#validate', function () {
    it('should reject malformed fields', function () {
      var payload = ProUpShareTxPayload.fromBuffer(Buffer.from(raw));
      [
        { proTxHash: 'ab' },
        { shareIndex: -1 },
        { inputsHash: 'ab' },
        { payloadSig: '00' },
        { scriptReward: '6a' },
      ].forEach(function (override) {
        var copy = payload.copy();
        Object.assign(copy, override);
        expect(function () {
          copy.validate();
        }).to.throw();
      });
    });
  });
});
