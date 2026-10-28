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

describe('AssetLockPayload version 2 (Core V24)', function () {
  var fixtures = require('../../fixtures/core24-asset-locks.json');

  var p2shOutput = Output.fromObject({
    satoshis: 3000,
    script: Script.buildScriptHashOut(
      Script.buildPublicKeyHashOut(
        Address.fromString('XxGJLCB7BBXAgA1AbgtNDMyVpQV9yXd7oB', 'mainnet')
      )
    ).toHex()
  });

  it('should create version 1 payloads by default', function () {
    expect(new AssetLockPayload().version).to.be.equal(1);
  });

  it('should accept P2PKH and P2SH credit outputs in version 2', function () {
    var payload = AssetLockPayload.fromJSON({
      version: 2,
      creditOutputs: [output1.toJSON(), p2shOutput.toJSON()]
    });

    var parsed = AssetLockPayload.fromBuffer(payload.toBuffer());
    expect(parsed.version).to.be.equal(2);
    expect(parsed.creditOutputs).to.deep.equal([output1, p2shOutput]);
    expect(parsed.toBuffer()).to.deep.equal(payload.toBuffer());
  });

  it('should still allow only P2PKH credit outputs in version 1', function () {
    expect(function () {
      AssetLockPayload.fromJSON({
        version: 1,
        creditOutputs: [output1.toJSON(), p2shOutput.toJSON()]
      });
    }).to.throw('Invalid Argument: Credit output 1 is not P2PKH');
  });

  it('should allow only P2PKH and P2SH credit outputs in version 2', function () {
    expect(function () {
      AssetLockPayload.fromJSON({
        version: 2,
        creditOutputs: [
          output1.toJSON(),
          { satoshis: 1000, script: Script.buildDataOut('0x0').toHex() }
        ]
      });
    }).to.throw('Invalid Argument: Credit output 1 is not P2PKH or P2SH');
  });

  it('should reject a non-minimal P2PKH credit output, like Core', function () {
    // OP_DUP OP_HASH160 OP_PUSHDATA1 20 <hash> OP_EQUALVERIFY OP_CHECKSIG
    var nonMinimal = Output.fromObject({
      satoshis: 1000,
      script: '76a94c14' + '11'.repeat(20) + '88ac'
    });
    expect(nonMinimal.script.isPublicKeyHashOut()).to.be.equal(true);

    expect(function () {
      AssetLockPayload.fromJSON({
        version: 1,
        creditOutputs: [nonMinimal.toJSON()]
      });
    }).to.throw('Invalid Argument: Credit output 0 is not P2PKH');

    expect(function () {
      AssetLockPayload.fromJSON({
        version: 2,
        creditOutputs: [output1.toJSON(), nonMinimal.toJSON()]
      });
    }).to.throw('Invalid Argument: Credit output 1 is not P2PKH or P2SH');
  });

  it('should reject version 3', function () {
    var payload = validAssetLockPayload.copy();
    payload.version = 3;

    expect(function () {
      payload.validate();
    }).to.throw('Invalid Argument: Invalid version');
  });

  fixtures.assetLocksV2.forEach(function (fixture) {
    it('should round-trip Core asset lock ' + fixture.txid, function () {
      var tx = new DashcoreLib.Transaction(fixture.hex);
      var payload = tx.extraPayload;

      expect(payload).to.be.an.instanceOf(AssetLockPayload);
      expect(tx.toBuffer().toString('hex')).to.be.equal(fixture.hex);
      expect(tx.id).to.be.equal(fixture.txid);
      expect(payload.version).to.be.equal(fixture.version);
      expect(payload.creditOutputs.map(function (output) {
        return { valueSat: output.satoshis, scriptHex: output.script.toHex() };
      })).to.deep.equal(fixture.creditOutputs);

      var payloadBuffer = payload.toBuffer();
      expect(AssetLockPayload.fromBuffer(payloadBuffer).toBuffer())
        .to.deep.equal(payloadBuffer);
      expect(AssetLockPayload.fromJSON(payload.toJSON()).toBuffer())
        .to.deep.equal(payloadBuffer);
      expect(new DashcoreLib.Transaction(tx.toJSON()).toBuffer().toString('hex'))
        .to.be.equal(fixture.hex);
      expect(new DashcoreLib.Transaction(tx.toObject()).toBuffer().toString('hex'))
        .to.be.equal(fixture.hex);
    });
  });
});
