/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var DashcoreLib = require('../../..');

var fixtures = require('../../fixtures/core24-shared-masternode.json');

var Address = DashcoreLib.Address;
var PrivateKey = DashcoreLib.PrivateKey;
var ProUpSharedRegTxPayload =
  DashcoreLib.Transaction.Payload.ProUpSharedRegTxPayload;

var vectors = fixtures.transactions.filter(function (vector) {
  return vector.type === 12;
});

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProUpSharedRegTxPayload', function () {
  var vector = vectors[0];
  var raw = Buffer.from(vector.extraPayload, 'hex');

  vectors.forEach(function (vector) {
    describe('Core vector: ' + vector.description, function () {
      var raw = Buffer.from(vector.extraPayload, 'hex');

      it('should parse the fields Core decodes', function () {
        var payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.version).to.equal(vector.decoded.version);
        expect(payload.proTxHash).to.equal(vector.decoded.proTxHash);
        expect(payload.pubKeyOperator).to.equal(vector.decoded.pubKeyOperator);
        expect(payload.inputsHash).to.equal(vector.decoded.inputsHash);
        expect(payload.payloadSigs).to.have.lengthOf(vector.decoded.sigCount);
        // keyIDVoting is kept byte-reversed, like the other ProTx payloads
        var votingAddress = Address.fromPublicKeyHash(
          Buffer.from(payload.keyIDVoting, 'hex').reverse(),
          'testnet'
        );
        expect(votingAddress.toString()).to.equal(vector.decoded.votingAddress);
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', function () {
        var payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.toBuffer()).to.deep.equal(raw);
        expect(
          ProUpSharedRegTxPayload.fromJSON(payload.toJSON()).toBuffer()
        ).to.deep.equal(raw);
        expect(payload.copy().toBuffer()).to.deep.equal(raw);
      });

      it('should verify one signature per share, in share order', function () {
        var payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
        var owners = vector.shareOwnerAddresses;
        expect(payload.payloadSigs).to.have.lengthOf(owners.length);
        owners.forEach(function (owner, index) {
          var otherOwner = owners[(index + 1) % owners.length];
          expect(payload.verifySignature(keyId(owner), index)).to.be.true;
          expect(payload.verifySignature(keyId(otherOwner), index)).to.be.false;
        });
      });
    });
  });

  describe('serialization', function () {
    it('should omit the signature list with skipSignature, as Core hashes the payload', function () {
      var payload = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw));
      var unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.deep.equal(
        raw.slice(0, raw.length - 1 - 65 * payload.payloadSigs.length)
      );
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property('payloadSigs');
    });

    it('should serialize an unsigned payload with an empty signature list', function () {
      var json = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
        skipSignature: true,
      });
      var bytes = ProUpSharedRegTxPayload.fromJSON(json).toBuffer();
      expect(bytes[bytes.length - 1]).to.equal(0);
      expect(ProUpSharedRegTxPayload.fromBuffer(bytes).payloadSigs).to.deep.equal([]);
    });

    it('should throw when the raw payload has trailing bytes', function () {
      expect(function () {
        ProUpSharedRegTxPayload.fromBuffer(Buffer.from(vector.extraPayload + '00', 'hex'));
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });
  });

  describe('#sign', function () {
    it('should append signatures of the payload hash in signing order', function () {
      var keys = [new PrivateKey(), new PrivateKey()];
      var payload = ProUpSharedRegTxPayload.fromJSON(
        ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON({
          skipSignature: true,
        })
      );
      keys.forEach(function (key) {
        payload.sign(key);
      });
      var restored = ProUpSharedRegTxPayload.fromBuffer(payload.toBuffer());
      keys.forEach(function (key, index) {
        expect(restored.verifySignature(key.toAddress().hashBuffer, index)).to.be.true;
      });
      expect(restored.verifySignature(keys[1].toAddress().hashBuffer, 0)).to.be.false;
    });
  });

  describe('#validate', function () {
    var json = ProUpSharedRegTxPayload.fromBuffer(Buffer.from(raw)).toJSON();

    it('should reject malformed fields', function () {
      [
        { proTxHash: 'ab' },
        { pubKeyOperator: json.pubKeyOperator.slice(2) },
        { keyIDVoting: json.keyIDVoting + '00' },
        { inputsHash: 'ab' },
        { payloadSigs: ['00'] },
      ].forEach(function (override) {
        expect(function () {
          ProUpSharedRegTxPayload.fromJSON(Object.assign({}, json, override));
        }).to.throw();
      });
    });
  });
});
