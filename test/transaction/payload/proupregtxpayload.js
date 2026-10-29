/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');
var DashcoreLib = require('../../..');
var proUpRegTxFixture = require('../../fixtures/payload/proupregtxpayload');

var Payload = DashcoreLib.Transaction.Payload;
var ProUpRegTxPayload = Payload.ProUpRegTxPayload;

describe('ProUpRegTxPayload', function () {
  beforeEach(function () {
    sinon.spy(ProUpRegTxPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProUpRegTxPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProUpRegTxPayload and call #validate on it', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );
      expect(payload.validate.callCount).to.be.equal(1);

      expect(
        payload.toJSON({
          network: 'testnet',
          skipSignature: true,
        })
      ).to.be.deep.equal(proUpRegTxFixture.getProUpRegPayloadJSON());
    });

    it('Should throw an error when there is unexpected information in the raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proUpRegTxFixture.getProUpRegPayloadHex() + '0000',
        'hex'
      );
      expect(function () {
        ProUpRegTxPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProUpRegTxPayload and call #validate on it', function () {
      var payload = ProUpRegTxPayload.fromJSON(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );

      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({
        network: 'testnet',
        skipSignature: true,
      });

      expect(payloadJSON).to.be.deep.equal(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );

      var restoredBuffer = ProUpRegTxPayload.fromJSON(
        payload.toJSON()
      ).toBuffer();
      expect(restoredBuffer.toString('hex')).to.be.equal(
        proUpRegTxFixture.getProUpRegPayloadHex()
      );
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var payload = ProUpRegTxPayload.fromBuffer(
        proUpRegTxFixture.getProUpRegPayloadBuffer()
      );

      var serializedPayload = payload.toBuffer();
      expect(serializedPayload.toString('hex')).to.be.equal(
        proUpRegTxFixture.getProUpRegPayloadHex()
      );
    });

    it('Should call #validate', function () {
      var payload = ProUpRegTxPayload.fromJSON(
        proUpRegTxFixture.getProUpRegPayloadJSON()
      );
      ProUpRegTxPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('version 3 (ExtAddr)', function () {
    var vector = require('../../fixtures/core24-protx.json').transactions.find(
      function (v) {
        return v.name === 'v3 ProUpRegTx';
      }
    );

    it('Should keep version 1 as the default for new payloads', function () {
      expect(new ProUpRegTxPayload().version).to.be.equal(1);
    });

    function getPayload() {
      return new DashcoreLib.Transaction(vector.hex).extraPayload;
    }

    function p2pkh(keyID) {
      return '76a914' + Buffer.from(keyID, 'hex').reverse().toString('hex') + '88ac';
    }

    it('Should validate the Core vector', function () {
      getPayload().validate();
    });

    it('Should require a version from 1 to 3', function () {
      [0, 4].forEach(function (version) {
        var payload = getPayload();
        payload.version = version;
        expect(function () {
          payload.validate();
        }).to.throw('Expect version to be an integer from 1 to 3');
      });
    });

    it('Should require valid payouts', function () {
      var payload = getPayload();
      payload.payouts = [];
      expect(function () {
        payload.validate();
      }).to.throw('Expect payouts to be an array of 1 to 8 payouts');

      payload = getPayload();
      payload.payouts[0].reward = 9999;
      expect(function () {
        payload.validate();
      }).to.throw('Expect payout rewards to add up to 10000');
    });

    it('Should reject a payee paying the voting key but not check an owner key', function () {
      var payload = getPayload();
      payload.payouts[0].scriptPayout = p2pkh(payload.keyIDVoting);
      expect(function () {
        payload.validate();
      }).to.throw('Expect payouts not to pay the owner or voting key');
    });

    it('Should reject an unknown version while parsing', function () {
      var raw = Buffer.from(getPayload().toBuffer());
      [0, 4].forEach(function (version) {
        raw.writeUInt16LE(version, 0);
        expect(function () {
          ProUpRegTxPayload.fromBuffer(raw);
        }).to.throw('Expect version to be an integer from 1 to 3');
      });
    });

    it('Should require mode 0, a 48 byte operator key and a non-null 20 byte voting key', function () {
      var payload = getPayload();
      payload.mode = 1;
      expect(function () {
        payload.validate();
      }).to.throw('Expect mode to be 0');

      payload = getPayload();
      payload.pubKeyOperator = payload.pubKeyOperator.slice(2);
      expect(function () {
        payload.validate();
      }).to.throw('Expect pubKeyOperator to be 48 bytes in size');

      ['00'.repeat(20), getPayload().keyIDVoting.slice(2)].forEach(function (keyID) {
        payload = getPayload();
        payload.keyIDVoting = keyID;
        expect(function () {
          payload.validate();
        }).to.throw('Expect keyIDVoting to be a non-null 20 byte key id');
      });
    });

    it('Should check a version 1 or 2 payout script like a payout list', function () {
      var payload = ProUpRegTxPayload.fromBuffer(proUpRegTxFixture.getProUpRegPayloadBuffer());
      payload.validate();
      payload.scriptPayout = p2pkh(payload.keyIDVoting);
      expect(function () {
        payload.validate();
      }).to.throw('Expect payouts not to pay the owner or voting key');
      payload.scriptPayout = '';
      expect(function () {
        payload.validate();
      }).to.throw('Expected payout scriptPayout to be a p2pkh/p2sh');
    });

    it('Should require a compact signature', function () {
      var payload = getPayload();
      expect(payload.payloadSig).to.have.lengthOf(130);
      payload.payloadSig = payload.payloadSig.slice(2);
      expect(function () {
        payload.validate();
      }).to.throw("payloadSig size doesn't match compact signature size");
      payload.payloadSig = getPayload().payloadSig + '00';
      expect(function () {
        payload.validate();
      }).to.throw("payloadSig size doesn't match compact signature size");
    });

    it('Should reject fields of the other versions', function () {
      var json = getPayload().toJSON({ network: 'testnet' });
      json.payoutAddress = json.payouts[0].address;
      expect(function () {
        ProUpRegTxPayload.fromJSON(json);
      }).to.throw('Expect no payoutAddress in a version 3 payload');

      var legacyJSON = proUpRegTxFixture.getProUpRegPayloadJSON();
      legacyJSON.payouts = [];
      expect(function () {
        ProUpRegTxPayload.fromJSON(legacyJSON);
      }).to.throw('Expect no payouts in a version 1 payload');
    });
  });

  describe('fields it does not have', function () {
    it('Should reject type and platform fields', function () {
      var json = proUpRegTxFixture.getProUpRegPayloadJSON();
      ProUpRegTxPayload.fromJSON(json);
      ['type', 'platformNodeID', 'platformP2PPort', 'platformHTTPPort'].forEach(function (field) {
        var withField = Object.assign({}, json);
        withField[field] = 0;
        expect(function () {
          ProUpRegTxPayload.fromJSON(withField);
        }).to.throw('Expect no ' + field + ' in a ProUpRegTx payload');
      });
    });
  });
});
