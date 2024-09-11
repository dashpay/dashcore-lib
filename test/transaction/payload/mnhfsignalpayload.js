/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var MnHfSignalPayload = DashcoreLib.Transaction.Payload.MnHfSignalPayload;

var validMnHfSignalPayloadJSON = {
  version: 1,
  signal: {
    versionBit: 10,
    quorumHash: '00000000000000107c98e94bdb9ffb729fe9c190a6d1223fd9b6700ccb79b627',
    sig: 'a12bc6a3d43e76fd6ab5d48dff11998811747bf51ffe722d9fda93ae892e4b18a716f58045c86459d0dafd38ae1f7f520519002983fc307e92fa606c3eb5ac8cf6ca03a102889866d58c9207b483e0b975baee63c1202209293ff7393222f812'
  }
};

// Contains same data as JSON above
var validMnHfSignalPayload = MnHfSignalPayload.fromJSON(validMnHfSignalPayloadJSON);
var validMnHfSignalPayloadBuffer = validMnHfSignalPayload.toBuffer();
var validMnHfSignalPayloadHexString = validMnHfSignalPayloadBuffer.toString('hex');

describe('MnHfSignalPayload', function () {
  describe('.fromBuffer', function () {
    beforeEach(function () {
      sinon.spy(MnHfSignalPayload.prototype, 'validate');
    });

    afterEach(function () {
      MnHfSignalPayload.prototype.validate.restore();
    });

    it('Should return instance of MnHfSignalPayload and call #validate on it', function () {
      var payload = MnHfSignalPayload.fromBuffer(validMnHfSignalPayloadBuffer);

      expect(payload).to.be.an.instanceOf(MnHfSignalPayload);
      expect(payload.version).to.be.equal(1);
      expect(payload.signal.versionBit).to.be.equal(10);
      expect(payload.signal.quorumHash).to.be.equal('00000000000000107c98e94bdb9ffb729fe9c190a6d1223fd9b6700ccb79b627');
      expect(payload.signal.sig).to.be.equal(validMnHfSignalPayloadJSON.signal.sig);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        validMnHfSignalPayloadHexString + '0000',
        'hex'
      );

      expect(function () {
        MnHfSignalPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    before(function () {
      sinon.spy(MnHfSignalPayload.prototype, 'validate');
    });

    it('Should return instance of MnHfSignalPayload and call #validate on it', function () {
      var payload = MnHfSignalPayload.fromJSON(validMnHfSignalPayloadJSON);

      expect(payload).to.be.an.instanceOf(MnHfSignalPayload);
      expect(payload.version).to.be.equal(1);
      expect(payload.signal.versionBit).to.be.equal(10);
      expect(payload.signal.quorumHash).to.be.equal('00000000000000107c98e94bdb9ffb729fe9c190a6d1223fd9b6700ccb79b627');
      expect(payload.signal.sig).to.be.equal(validMnHfSignalPayloadJSON.signal.sig);
    });

    after(function () {
      MnHfSignalPayload.prototype.validate.restore();
    });
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as version', function () {
      var payload = validMnHfSignalPayload.copy();

      payload.version = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect version to be an unsigned integer');

      payload.version = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });

    it('Should validate signal fields correctly', function () {
      var payload = validMnHfSignalPayload.copy();

      // Invalid versionBit
      payload.signal.versionBit = 256;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect signal.versionBit to be an unsigned 8-bit integer');

      payload.signal.versionBit = 10;

      // Invalid quorumHash
      payload.signal.quorumHash = 'invalidhash';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect signal.quorumHash to be a valid 32-byte SHA256 hex string');

      payload.signal.quorumHash = validMnHfSignalPayloadJSON.signal.quorumHash;

      // Invalid sig
      payload.signal.sig = 'invalidsig';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect signal.sig to be a valid 96-byte hex string');

      payload.signal.sig = validMnHfSignalPayloadJSON.signal.sig;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(MnHfSignalPayload.prototype, 'validate');
    });

    afterEach(function () {
      MnHfSignalPayload.prototype.validate.restore();
    });

    it('Should serialize payload to JSON', function () {
      var payload = validMnHfSignalPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(payload.version);
      expect(payloadJSON.signal).to.deep.equal(payload.signal);
    });

    it('Should call #validate', function () {
      var payload = MnHfSignalPayload.fromJSON(validMnHfSignalPayloadJSON);
      MnHfSignalPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(MnHfSignalPayload.prototype, 'validate');
    });

    afterEach(function () {
      MnHfSignalPayload.prototype.validate.restore();
    });

    it('Should serialize payload to Buffer', function () {
      var payload = validMnHfSignalPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = MnHfSignalPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(payload.version);
      expect(restoredPayload.signal).to.deep.equal(payload.signal);
    });

    it('Should call #validate', function () {
      var payload = MnHfSignalPayload.fromJSON(validMnHfSignalPayloadJSON);
      MnHfSignalPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
