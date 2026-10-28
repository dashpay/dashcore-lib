/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var proRegTxFixture = require('../../fixtures/payload/proregtxpayload');

var DashcoreLib = require('../../../index');

var ProRegTxPayload = DashcoreLib.Transaction.Payload.ProRegTxPayload;

describe('ProRegTxPayload', function () {
  beforeEach(function () {
    sinon.spy(ProRegTxPayload.prototype, 'validate');
  });

  afterEach(function () {
    ProRegTxPayload.prototype.validate.restore();
  });

  describe('.fromBuffer', function () {
    it('Should return instance of ProRegTxPayload and call #validate on it', function () {
      var payload = ProRegTxPayload.fromBuffer(
        proRegTxFixture.getProRegPayloadBuffer()
      );

      expect(
        payload.toJSON({
          network: 'testnet',
          skipSignature: true,
        })
      ).to.be.deep.equal(proRegTxFixture.getProRegPayloadJSON());
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        proRegTxFixture.getProRegPayloadHex() + '0000',
        'hex'
      );

      expect(function () {
        ProRegTxPayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of ProRegTxPayload and call #validate on it', function () {
      var payload = ProRegTxPayload.fromJSON(
        proRegTxFixture.getProRegPayloadJSON()
      );
      var restoredJSON = payload.toJSON({ network: 'testnet' });

      expect(restoredJSON).to.be.deep.equal(
        proRegTxFixture.getProRegPayloadJSON()
      );
    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {
      var payload = ProRegTxPayload.fromBuffer(
        proRegTxFixture.getProRegPayloadBuffer()
      );

      var payloadJSON = payload.toJSON({
        network: 'testnet',
        skipSignature: true,
      });
      expect(payloadJSON).to.be.deep.equal(
        proRegTxFixture.getProRegPayloadJSON()
      );

      var restoredPayloadHex = ProRegTxPayload.fromJSON(payload.toJSON())
        .toBuffer()
        .toString('hex');
      expect(restoredPayloadHex).to.be.equal(
        proRegTxFixture.getProRegPayloadHex()
      );
    });

    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(
        proRegTxFixture.getProRegPayloadJSON()
      );
      ProRegTxPayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {
      var restoredPayload = ProRegTxPayload.fromBuffer(
        Buffer.from(proRegTxFixture.getProRegPayloadHex(), 'hex')
      );

      expect(restoredPayload.toBuffer().toString('hex')).to.be.equal(
        proRegTxFixture.getProRegPayloadHex()
      );
    });

    it('Should call #validate', function () {
      var payload = ProRegTxPayload.fromJSON(
        proRegTxFixture.getProRegPayloadJSON()
      );
      ProRegTxPayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('version 3 (ExtAddr)', function () {
    var vectors = require('../../fixtures/core24-protx.json').transactions;
    var Transaction = DashcoreLib.Transaction;

    function getPayload(name) {
      var vector = vectors.find(function (v) {
        return v.name === name;
      });
      return new Transaction(vector.hex).extraPayload;
    }

    function getSharedPayload() {
      return getPayload('v3 shared ProRegTx with an explicit reward script');
    }

    it('Should keep version 2 as the default for new payloads', function () {
      var json = proRegTxFixture.getProRegPayloadJSON();
      delete json.version;

      expect(new ProRegTxPayload().version).to.be.equal(2);
      expect(ProRegTxPayload.fromJSON(json).version).to.be.equal(2);
    });

    it('Should keep the version given in JSON', function () {
      var json = proRegTxFixture.getProRegPayloadJSON();
      json.version = 1;

      var payload = ProRegTxPayload.fromJSON(json);

      expect(payload.version).to.be.equal(1);
      expect(payload.toBuffer().readUInt16LE(0)).to.be.equal(1);
    });

    it('Should serialize a share without a reward script as an empty script', function () {
      var payload = getPayload('v3 shared ProRegTx rewarding the refund scripts');
      var json = payload.toJSON({ network: 'testnet' });

      expect(payload.shares[0].scriptReward).to.be.equal('');
      expect(json.shares[0]).to.not.have.property('rewardAddress');
      expect(ProRegTxPayload.fromJSON(json).shares[0].scriptReward).to.be.equal('');
    });

    it('Should require one join signature per share', function () {
      var payload = getSharedPayload();
      payload.joinSigs.pop();

      expect(function () {
        payload.toBuffer();
      }).to.throw('Expect one join signature per share');
    });

    it('Should require 65 byte join signatures', function () {
      var payload = getSharedPayload();
      payload.joinSigs[0] = payload.joinSigs[0].slice(2);

      expect(function () {
        payload.validate();
      }).to.throw('Expect join signatures to be 65 bytes in size');
    });

    it('Should require p2pkh/p2sh share scripts', function () {
      var payload = getSharedPayload();
      payload.shares[1].scriptReward = '6a';

      expect(function () {
        payload.validate();
      }).to.throw('Expected share scriptReward to be empty or a p2pkh/p2sh');

      payload = getSharedPayload();
      payload.shares[0].scriptRefund = '';

      expect(function () {
        payload.validate();
      }).to.throw('Expected share scriptRefund to be a p2pkh/p2sh');
    });

    it('Should require valid share amounts and early period terms', function () {
      var payload = getSharedPayload();
      payload.shares[0].amount = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Expect share amount to be an unsigned integer');

      payload = getSharedPayload();
      payload.earlyPeriodBlocks = 0x100000000;

      expect(function () {
        payload.validate();
      }).to.throw('Expect earlyPeriodBlocks to be an uint32');
    });

    it('Should require p2pkh/p2sh payouts with rewards of at most 10000', function () {
      var payload = getPayload('v3 ProRegTx with two payouts');
      payload.payouts[0].reward = 10001;

      expect(function () {
        payload.validate();
      }).to.throw('Expect payout reward to be an integer from 0 to 10000');

      payload = getPayload('v3 ProRegTx with two payouts');
      payload.payouts[0].scriptPayout = '6a';

      expect(function () {
        payload.validate();
      }).to.throw('Expected payout scriptPayout to be a p2pkh/p2sh');
    });

    it('Should require addresses that can be serialized', function () {
      var payload = getPayload('v3 evonode ProRegTx');
      payload.addresses = { core_p2p: ['not an address'] };

      expect(function () {
        payload.validate();
      }).to.throw('Invalid address entry');

      payload.addresses = undefined;

      expect(function () {
        payload.validate();
      }).to.throw('Expected addresses to be an object');
    });

    it('Should not write platform ports for a version 3 evonode', function () {
      var payload = getPayload('v3 evonode ProRegTx');
      var json = payload.toJSON({ network: 'testnet' });
      json.platformP2PPort = 26656;
      json.platformHTTPPort = 443;

      expect(ProRegTxPayload.fromJSON(json).toBuffer()).to.be.deep.equal(
        payload.toBuffer()
      );
    });
  });
});
