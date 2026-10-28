/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');
var proUpServTxFixture = require('../../fixtures/payload/proupservpayload');

var ProTxUpServPayload = DashcoreLib.Transaction.Payload.ProTxUpServPayload;

describe('ProTxUpServPayload', function () {
  beforeEach(function () {
    sinon.spy(ProTxUpServPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProTxUpServPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProTxUpServPayload and call #validate on it', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      expect(
        payload.toJSON({
          skipSignature: true,
          network: 'testnet',
        })
      ).to.be.deep.equal(proUpServTxFixture.getProUpServPayloadJSON());
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proUpServTxFixture.getProUpServPayloadHex() + '0000',
        'hex'
      );

      expect(function () {
        ProTxUpServPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProTxUpServPayload and call #validate on it', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );

      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({
        network: 'testnet',
        skipSignature: true,
      });

      expect(payloadJSON).to.be.deep.equal(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
      ProTxUpServPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var payload = ProTxUpServPayload.fromBuffer(
        proUpServTxFixture.getProUpServPayloadBuffer()
      );

      expect(payload.toBuffer().toString('hex')).to.be.equal(
        proUpServTxFixture.getProUpServPayloadHex()
      );
    });
    it('Should call #validate', function () {
      var payload = ProTxUpServPayload.fromJSON(
        proUpServTxFixture.getProUpServPayloadJSON()
      );
      ProTxUpServPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('operator payout', function () {
    it('Should leave out the operator payout address when there is none', function () {
      var json = proUpServTxFixture.getProUpServPayloadJSON();
      delete json.operatorPayoutAddress;

      var payload = ProTxUpServPayload.fromJSON(json);
      var restored = ProTxUpServPayload.fromJSON(
        payload.toJSON({ network: 'testnet' })
      );

      expect(payload.scriptOperatorPayout).to.be.equal('');
      expect(payload.toJSON({ network: 'testnet' })).to.be.deep.equal(json);
      expect(restored.toBuffer()).to.be.deep.equal(payload.toBuffer());
    });
  });

  describe('version 3 (ExtAddr)', function () {
    var vectors = require('../../fixtures/core24-protx.json').transactions;

    function getPayload() {
      var vector = vectors.find(function (v) {
        return v.name === 'v3 evonode ProUpServTx';
      });
      return new DashcoreLib.Transaction(vector.hex).extraPayload;
    }

    it('Should require addresses that can be serialized', function () {
      var payload = getPayload();
      payload.addresses = { core_p2p: ['1.2.3.4:9999'], unknown: [] };

      expect(function () {
        payload.validate();
      }).to.throw('Unknown address purpose unknown');
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

    it('Should require addresses, with the purposes of the node type', function () {
      var payload = getPayload();
      payload.addresses = {};
      expect(function () {
        payload.validate();
      }).to.throw('Expected addresses to have core_p2p entries');

      payload = getPayload();
      payload.type = 0;
      expect(function () {
        payload.validate();
      }).to.throw('Expected regular masternode addresses to have no platform entries');

      payload = getPayload();
      delete payload.addresses.platform_p2p;
      expect(function () {
        payload.validate();
      }).to.throw('Expected evonode addresses to have platform_p2p and platform_https entries');
    });

    it('Should reject an unknown version while parsing', function () {
      var raw = Buffer.from(getPayload().toBuffer());
      [0, 4].forEach(function (version) {
        raw.writeUInt16LE(version, 0);
        expect(function () {
          ProTxUpServPayload.fromBuffer(raw);
        }).to.throw('Expect version to be an integer from 1 to 3');
      });
    });

    it('Should require a regular or evo type', function () {
      var payload = getPayload();
      payload.type = 2;
      expect(function () {
        payload.validate();
      }).to.throw('Expect type to be 0 (regular) or 1 (evo)');
    });

    it('Should require a non-null platformNodeID for evonodes', function () {
      var payload = getPayload();
      payload.platformNodeID = '00'.repeat(20);
      expect(function () {
        payload.validate();
      }).to.throw('Expect platformNodeID to be a non-null 20 byte key id');
    });

    it('Should require a 96 byte BLS signature', function () {
      var payload = getPayload();
      payload.validate();
      payload.payloadSig = payload.payloadSig.slice(2);
      expect(function () {
        payload.validate();
      }).to.throw("payloadSig size doesn't match BLS signature size");
      payload.payloadSig = getPayload().payloadSig + '00';
      expect(function () {
        payload.validate();
      }).to.throw("payloadSig size doesn't match BLS signature size");
    });

    it('Should reject fields of the other versions', function () {
      var json = getPayload().toJSON({ network: 'testnet' });
      ['service', 'platformP2PPort', 'platformHTTPPort'].forEach(function (field) {
        var withField = Object.assign({}, json);
        withField[field] = field === 'service' ? '1.2.3.4:9999' : 1;
        expect(function () {
          ProTxUpServPayload.fromJSON(withField);
        }).to.throw('Expect no ' + field + ' in a version 3 payload');
      });

      var legacyJSON = proUpServTxFixture.getProUpServPayloadJSON();
      legacyJSON.addresses = {};
      expect(function () {
        ProTxUpServPayload.fromJSON(legacyJSON);
      }).to.throw('Expect no addresses in a version 1 payload');
    });
  });

  describe('versions 1 and 2', function () {
    function getV2Evo() {
      var json = proUpServTxFixture.getProUpServPayloadJSON();
      json.version = 2;
      json.type = 1;
      json.platformNodeID = '11'.repeat(20);
      json.platformP2PPort = 36656;
      json.platformHTTPPort = 1443;
      return ProTxUpServPayload.fromJSON(json);
    }

    it('Should require a service address', function () {
      var json = proUpServTxFixture.getProUpServPayloadJSON();
      json.service = '[0:0:0:0:0:0:0:0]:0';
      expect(function () {
        ProTxUpServPayload.fromJSON(json);
      }).to.throw('Expected service to be a string with ip address and port');
    });

    it('Should check the platform fields of a version 2 evonode', function () {
      var payload = getV2Evo();
      payload.validate();

      payload.platformNodeID = '00'.repeat(20);
      expect(function () {
        payload.validate();
      }).to.throw('Expect platformNodeID to be a non-null 20 byte key id');

      payload = getV2Evo();
      payload.platformHTTPPort = 9999;
      expect(function () {
        payload.validate();
      }).to.throw('Expect platform ports not to be the mainnet Core port 9999');

      payload = getV2Evo();
      payload.platformP2PPort = 19999;
      expect(function () {
        payload.validate();
      }).to.throw('Expect the platform ports and the Core port to differ');
    });
  });
});
