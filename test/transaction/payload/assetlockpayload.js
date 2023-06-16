/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var BN = require('../../../lib/crypto/bn');

var AssetLockPayload = DashcoreLib.Transaction.Payload.AssetLockPayload;
var Script = DashcoreLib.Script;
var Address = DashcoreLib.Address;
var Output = DashcoreLib.Transaction.Output;

var output1 = Output.fromObject({
  satoshis: 1000,
  script: Script.buildPublicKeyHashOut(
    Address.fromString('XxGJLCB7BBXAgA1AbgtNDMyVpQV9yXd7oB', 'mainnet')
  ).toHex()
});

var output2 = Output.fromObject({
  satoshis: 2000,
  script: Script.buildPublicKeyHashOut(
    Address.fromString('7hRXBxSmKqaJ6JfsVaSeZqAeyxvrxcHyV1', 'mainnet')
  ).toHex()
});


var validAssetLockPayloadJSON = {
  version: 1,
  creditOutputs: [
    output1.toJSON(),
    output2.toJSON()
  ]
};
// Contains same data as JSON above
var validAssetLockPayload = AssetLockPayload.fromJSON(validAssetLockPayloadJSON);
var validAssetLockPayloadBuffer = validAssetLockPayload.toBuffer();
var validAssetLockPayloadHexString = validAssetLockPayloadBuffer.toString('hex');

describe('AssetLockPayload', function () {
  describe('.fromBuffer', function () {
    beforeEach(function () {
      sinon.spy(AssetLockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetLockPayload.prototype.validate.restore();
    });

    it('Should return instance of AssetLockPayload and call #validate on it', function () {
      var payload = AssetLockPayload.fromBuffer(validAssetLockPayloadBuffer);

      expect(payload).to.be.an.instanceOf(AssetLockPayload);
      expect(payload.version).to.be.equal(1);
      expect(payload.creditOutputs).to.deep.equal([
        output1,
        output2
      ]);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        validAssetLockPayloadHexString + '0000',
        'hex'
      );

      expect(function () {
        AssetLockPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    before(function () {
      sinon.spy(AssetLockPayload.prototype, 'validate');
    });

    it('Should return instance of AssetLockPayload and call #validate on it', function () {
      var payload = AssetLockPayload.fromJSON(validAssetLockPayloadJSON);

      expect(payload).to.be.an.instanceOf(AssetLockPayload);
      expect(payload.version).to.be.equal(1);
      expect(payload.creditOutputs)
        .to.deep.equal([
          output1,
          output2
        ]);
    });

    after(function () {
      AssetLockPayload.prototype.validate.restore();
    });
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as version', function () {
      var payload = validAssetLockPayload.copy();

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

    describe('creditOutputs', function () {
      it('should not allow empty array', function() {
        var payload = validAssetLockPayload.copy();
        payload.creditOutputs = [];

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: Empty credit outputs'
        );
      });

      it('should allow only instances of Output', function() {
        var payload = validAssetLockPayload.copy();
        payload.creditOutputs.push('Test');

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: Credit output 2 is not an instance of Output'
        );
      });

      it('should allow only P2PKH Outputs', function() {
        var payload = validAssetLockPayload.copy();
        payload.creditOutputs.push(Output.fromObject({
          satoshis: 1000,
          script: Script.buildDataOut('0x0')
        }));

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: Credit output 2 is not P2PKH'
        );
      });
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(AssetLockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetLockPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validAssetLockPayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(payload.version);
      expect(payloadJSON.creditOutputs)
        .to.deep.equal(payload.creditOutputs.map(output => output.toJSON()));
    });
    it('Should call #validate', function () {
      var payload = AssetLockPayload.fromJSON(validAssetLockPayloadJSON);
      AssetLockPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(AssetLockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetLockPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validAssetLockPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = AssetLockPayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(payload.version);
      expect(payload.creditOutputs).to.deep.equal([
        output1,
        output2
      ]);
    });
    it('Should call #validate', function () {
      var payload = AssetLockPayload.fromJSON(validAssetLockPayloadJSON);
      AssetLockPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
