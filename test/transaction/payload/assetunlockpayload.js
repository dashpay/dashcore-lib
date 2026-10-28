/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var BN = require('../../../lib/crypto/bn');

var AssetUnlockPayload = DashcoreLib.Transaction.Payload.AssetUnlockPayload;
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


var validAssetUnlockPayloadJSON = {
  version: 1,
  index: 301,
  fee: 70000,
  requestHeight: 1317,
  quorumHash: '4acfa5c6d92071d206da5b767039d42f24e7ab1a694a5b8014cddc088311e448',
  quorumSig: 'aee468c03feec7caada0599457136ef0dfe9365657a42ef81bb4aa53af383d05d90552b2cd23480cae24036b953ba8480d2f98291271a338e4235265dea94feacb54d1fd96083151001eff4156e7475e998154a8e6082575e2ee461b394d24f7'
};

// Contains same data as JSON above
var validAssetUnlockPayload = AssetUnlockPayload.fromJSON(validAssetUnlockPayloadJSON);
var validAssetUnlockPayloadHexString = "012d0100000000000070110100250500004acfa5c6d92071d206da5b767039d42f24e7ab1a694a5b8014cddc088311e448aee468c03feec7caada0599457136ef0dfe9365657a42ef81bb4aa53af383d05d90552b2cd23480cae24036b953ba8480d2f98291271a338e4235265dea94feacb54d1fd96083151001eff4156e7475e998154a8e6082575e2ee461b394d24f7";
var validAssetUnlockPayloadBuffer = Buffer.from(validAssetUnlockPayloadHexString, "hex")

describe('AssetUnlockPayload', function () {
  describe('.fromBuffer', function () {
    beforeEach(function () {
      sinon.spy(AssetUnlockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetUnlockPayload.prototype.validate.restore();
    });

    it('Should return instance of AssetUnlockPayload and call #validate on it', function () {
      var payload = AssetUnlockPayload.fromBuffer(validAssetUnlockPayloadBuffer);

      const {
        version,
        index,
        fee,
        requestHeight,
        quorumHash,
        quorumSig
      } = validAssetUnlockPayloadJSON;

      expect(payload).to.be.an.instanceOf(AssetUnlockPayload);
      expect(payload.version).to.be.equal(version);
      expect(payload.index).to.be.equal(index);
      expect(payload.fee).to.be.equal(fee);
      expect(payload.requestHeight).to.be.equal(requestHeight);
      expect(payload.quorumHash).to.be.equal(quorumHash);
      expect(payload.quorumSig).to.be.equal(quorumSig);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        validAssetUnlockPayloadHexString + '0000',
        'hex'
      );

      expect(function () {
        AssetUnlockPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    before(function () {
      sinon.spy(AssetUnlockPayload.prototype, 'validate');
    });

    it('Should return instance of AssetUnlockPayload and call #validate on it', function () {
      var payload = AssetUnlockPayload.fromJSON(validAssetUnlockPayloadJSON);

      expect(payload).to.be.an.instanceOf(AssetUnlockPayload);
      const {
        version,
        index,
        fee,
        requestHeight,
        quorumHash,
        quorumSig
      } = validAssetUnlockPayloadJSON;

      expect(payload).to.be.an.instanceOf(AssetUnlockPayload);
      expect(payload.version).to.be.equal(version);
      expect(payload.index).to.be.equal(index);
      expect(payload.fee).to.be.equal(fee);
      expect(payload.requestHeight).to.be.equal(requestHeight);
      expect(payload.quorumHash).to.be.equal(quorumHash);
      expect(payload.quorumSig).to.be.equal(quorumSig);
    });

    after(function () {
      AssetUnlockPayload.prototype.validate.restore();
    });
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as version', function () {
      var payload = validAssetUnlockPayload.copy();

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

    it('Should allow only unsigned integer as index', function () {
      var payload = validAssetUnlockPayload.copy();

      payload.index = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect index to be an unsigned integer');

      payload.index = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect index to be an unsigned integer');

      payload.index = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect index to be an unsigned integer');

      payload.index = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect index to be an unsigned integer');

      payload.index = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });

    it('Should allow only unsigned integer as fee', function () {
      var payload = validAssetUnlockPayload.copy();

      payload.fee = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect fee to be an unsigned integer');

      payload.fee = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect fee to be an unsigned integer');

      payload.fee = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect fee to be an unsigned integer');

      payload.fee = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect fee to be an unsigned integer');

      payload.fee = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });

    it('Should allow only unsigned integer as requestHeight', function () {
      var payload = validAssetUnlockPayload.copy();

      payload.requestHeight = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect requestHeight to be an unsigned integer');

      payload.requestHeight = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect requestHeight to be an unsigned integer');

      payload.requestHeight = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect requestHeight to be an unsigned integer');

      payload.requestHeight = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect requestHeight to be an unsigned integer');

      payload.requestHeight = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });

    it('Should allow only hex string as quorumHash', function () {
      var payload = validAssetUnlockPayload.copy();

      payload.quorumHash = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumHash to be a hex string');

      payload.quorumHash = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumHash to be a hex string');

      payload.quorumHash = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumHash to be a hex string');

      payload.quorumHash = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });

    it('Should allow only hex string as quorumSig', function () {
      var payload = validAssetUnlockPayload.copy();

      payload.quorumSig = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumSig to be a hex string');

      payload.quorumSig = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumSig to be a hex string');

      payload.quorumSig = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Expect quorumSig to be a hex string');

      payload.quorumSig = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(AssetUnlockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetUnlockPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validAssetUnlockPayload.copy();

      var payloadJSON = payload.toJSON();

      const {
        version,
        index,
        fee,
        requestHeight,
        quorumHash,
        quorumSig
      } = validAssetUnlockPayloadJSON;

      expect(payload).to.be.an.instanceOf(AssetUnlockPayload);
      expect(payload.version).to.be.equal(version);
      expect(payload.index).to.be.equal(index);
      expect(payload.fee).to.be.equal(fee);
      expect(payload.requestHeight).to.be.equal(requestHeight);
      expect(payload.quorumHash).to.be.equal(quorumHash);
      expect(payload.quorumSig).to.be.equal(quorumSig);
    });
    it('Should call #validate', function () {
      var payload = AssetUnlockPayload.fromJSON(validAssetUnlockPayloadJSON);
      AssetUnlockPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(AssetUnlockPayload.prototype, 'validate');
    });

    afterEach(function () {
      AssetUnlockPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validAssetUnlockPayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = AssetUnlockPayload.fromBuffer(serializedPayload);

      const {
        version,
        index,
        fee,
        requestHeight,
        quorumHash,
        quorumSig
      } = validAssetUnlockPayloadJSON;

      expect(restoredPayload).to.be.an.instanceOf(AssetUnlockPayload);
      expect(restoredPayload.version).to.be.equal(version);
      expect(restoredPayload.index).to.be.equal(index);
      expect(restoredPayload.fee).to.be.equal(fee);
      expect(restoredPayload.requestHeight).to.be.equal(requestHeight);
      expect(restoredPayload.quorumHash).to.be.equal(quorumHash);
      expect(restoredPayload.quorumSig).to.be.equal(quorumSig);
    });
    it('Should call #validate', function () {
      var payload = AssetUnlockPayload.fromJSON(validAssetUnlockPayloadJSON);
      AssetUnlockPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});

describe('AssetUnlockPayload version 2 (Core V24)', function () {
  var fixtures = require('../../fixtures/core24-asset-locks.json');

  it('should create version 1 payloads by default', function () {
    expect(new AssetUnlockPayload().version).to.be.equal(1);
  });

  it('should serialize version 2 like version 1', function () {
    var payload = AssetUnlockPayload.fromJSON(
      Object.assign({}, validAssetUnlockPayloadJSON, { version: 2 })
    );

    expect(payload.toBuffer().toString('hex')).to.be.equal(
      '02' + validAssetUnlockPayloadHexString.slice(2)
    );
    expect(AssetUnlockPayload.fromBuffer(payload.toBuffer()).toJSON())
      .to.deep.equal(payload.toJSON());
  });

  it('should reject version 3', function () {
    var payload = validAssetUnlockPayload.copy();
    payload.version = 3;

    expect(function () {
      payload.validate();
    }).to.throw('Invalid Argument: Invalid version');
  });

  fixtures.assetUnlocksV2.forEach(function (fixture) {
    it('should parse the payload of Core asset unlock ' + fixture.txid, function () {
      var payloadHex = fixture.hex.slice(-145 * 2);
      var payload = AssetUnlockPayload.fromBuffer(Buffer.from(payloadHex, 'hex'));

      expect(payload.version).to.be.equal(fixture.version);
      expect(payload.index).to.be.equal(fixture.index);
      expect(payload.fee).to.be.equal(fixture.fee);
      expect(payload.requestHeight).to.be.equal(fixture.requestedHeight);
      // quorumHash keeps wire byte order; Core prints it reversed
      expect(payload.quorumHash).to.be.equal(
        Buffer.from(fixture.quorumHash, 'hex').reverse().toString('hex')
      );
      expect(payload.toBuffer().toString('hex')).to.be.equal(payloadHex);
      expect(AssetUnlockPayload.fromJSON(payload.toJSON()).toBuffer().toString('hex'))
        .to.be.equal(payloadHex);
    });
  });
});
