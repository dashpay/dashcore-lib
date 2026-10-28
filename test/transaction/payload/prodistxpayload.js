/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var DashcoreLib = require('../../..');

var fixtures = require('../../fixtures/core24-shared-masternode.json');

var Address = DashcoreLib.Address;
var PrivateKey = DashcoreLib.PrivateKey;
var Transaction = DashcoreLib.Transaction;
var ProDisTxPayload = Transaction.Payload.ProDisTxPayload;

var vectors = fixtures.transactions.filter(function (vector) {
  return vector.type === 10;
});

function keyId(address) {
  return new Address(address).hashBuffer;
}

describe('ProDisTxPayload', function () {
  var unilateral = vectors[0];
  var unanimous = vectors[vectors.length - 1];

  vectors.forEach(function (vector) {
    describe('Core vector: ' + vector.description, function () {
      var raw = Buffer.from(vector.extraPayload, 'hex');

      it('should parse the fields Core decodes', function () {
        var payload = ProDisTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.version).to.equal(vector.decoded.version);
        expect(payload.proTxHash).to.equal(vector.decoded.proTxHash);
        expect(payload.actorIndex).to.equal(vector.decoded.actorIndex);
        expect(payload.payloadSigs).to.have.lengthOf(vector.decoded.sigCount);
      });

      it('should serialize back to the same bytes via buffer, JSON and copy', function () {
        var payload = ProDisTxPayload.fromBuffer(Buffer.from(raw));
        expect(payload.toBuffer()).to.deep.equal(raw);
        expect(ProDisTxPayload.fromJSON(payload.toJSON()).toBuffer()).to.deep.equal(raw);
        expect(payload.copy().toBuffer()).to.deep.equal(raw);
      });

      it('should verify every signature against the share owner that made it', function () {
        var tx = new Transaction(vector.hex);
        var payload = tx.extraPayload;
        var isUnilateral = payload.payloadSigs.length === 1;
        payload.payloadSigs.forEach(function (sig, index) {
          var owner = isUnilateral ? payload.actorIndex : index;
          var otherOwner = (owner + 1) % vector.shareOwnerAddresses.length;
          expect(
            payload.verifySignature(keyId(vector.shareOwnerAddresses[owner]), tx, index)
          ).to.be.true;
          expect(
            payload.verifySignature(keyId(vector.shareOwnerAddresses[otherOwner]), tx, index)
          ).to.be.false;
        });
      });
    });
  });

  describe('#getSignHash', function () {
    it('should commit to the signature count, which selects the mode', function () {
      var tx = new Transaction(unilateral.hex);
      expect(tx.extraPayload.getSignHash(tx, 1)).to.not.deep.equal(
        tx.extraPayload.getSignHash(tx, 2)
      );
    });

    it('should commit to the transaction locktime, sequences and outputs', function () {
      var owner = keyId(unilateral.shareOwnerAddresses[unilateral.decoded.actorIndex]);
      var mutations = [
        function (tx) { tx.nLockTime = 1; },
        function (tx) { tx.inputs[0].sequenceNumber -= 1; },
        function (tx) { tx.outputs[0].satoshis -= 1; },
      ];
      mutations.forEach(function (mutate) {
        var tx = new Transaction(unilateral.hex);
        expect(tx.extraPayload.verifySignature(owner, tx)).to.be.true;
        mutate(tx);
        expect(tx.extraPayload.verifySignature(owner, tx)).to.be.false;
      });
    });

    it('should reject a signature count that does not fit in a byte', function () {
      var tx = new Transaction(unilateral.hex);
      expect(function () {
        tx.extraPayload.getSignHash(tx, 256);
      }).to.throw('Expected sigCount');
    });
  });

  describe('#sign', function () {
    it('should append signatures that verify, in signing order', function () {
      var tx = new Transaction(unanimous.hex);
      var keys = [new PrivateKey(), new PrivateKey()];
      var payload = ProDisTxPayload.fromJSON(tx.extraPayload.toJSON({ skipSignature: true }));
      keys.forEach(function (key) {
        payload.sign(key, tx, keys.length);
      });

      expect(payload.payloadSigs).to.have.lengthOf(2);
      keys.forEach(function (key, index) {
        expect(payload.verifySignature(key.toAddress().hashBuffer, tx, index)).to.be.true;
      });
      expect(payload.verifySignature(keys[0].toAddress().hashBuffer, tx, 1)).to.be.false;
    });

    it('should not verify a unilateral signature as part of a unanimous set', function () {
      var tx = new Transaction(unilateral.hex);
      var key = new PrivateKey();
      var payload = ProDisTxPayload.fromJSON(tx.extraPayload.toJSON({ skipSignature: true }));
      payload.sign(key, tx, 1);
      expect(payload.verifySignature(key.toAddress().hashBuffer, tx)).to.be.true;
      payload.payloadSigs.push(payload.payloadSigs[0]);
      expect(payload.verifySignature(key.toAddress().hashBuffer, tx)).to.be.false;
    });
  });

  describe('serialization', function () {
    it('should drop the signatures with skipSignature', function () {
      var payload = ProDisTxPayload.fromBuffer(Buffer.from(unanimous.extraPayload, 'hex'));
      expect(payload.toJSON({ skipSignature: true })).to.not.have.property('payloadSigs');
      var unsigned = payload.toBuffer({ skipSignature: true });
      expect(unsigned).to.have.lengthOf(37);
      expect(unsigned[36]).to.equal(0);
      expect(ProDisTxPayload.fromBuffer(unsigned).payloadSigs).to.deep.equal([]);
    });

    it('should throw when the raw payload has trailing bytes', function () {
      expect(function () {
        ProDisTxPayload.fromBuffer(Buffer.from(unilateral.extraPayload + '00', 'hex'));
      }).to.throw('Failed to parse payload: raw payload is bigger than expected.');
    });

    it('should throw when the signature list is truncated', function () {
      expect(function () {
        ProDisTxPayload.fromBuffer(
          Buffer.from(unilateral.extraPayload.slice(0, -2), 'hex')
        );
      }).to.throw('Expected each payloadSig');
    });
  });

  describe('#validate', function () {
    var json = ProDisTxPayload.fromBuffer(
      Buffer.from(unilateral.extraPayload, 'hex')
    ).toJSON();

    it('should reject malformed fields', function () {
      [
        { proTxHash: 'ab' },
        { actorIndex: -1 },
        { actorIndex: 1.5 },
        { payloadSigs: ['00'] },
        { payloadSigs: 'ab' },
      ].forEach(function (override) {
        expect(function () {
          ProDisTxPayload.fromJSON(Object.assign({}, json, override));
        }).to.throw();
      });
    });

    it('should reject more signatures than the count byte can hold', function () {
      var sigs = [];
      for (var i = 0; i < 256; i++) {
        sigs.push(json.payloadSigs[0]);
      }
      expect(function () {
        ProDisTxPayload.fromJSON(Object.assign({}, json, { payloadSigs: sigs }));
      }).to.throw('Expected payloadSigs');
    });
  });
});
