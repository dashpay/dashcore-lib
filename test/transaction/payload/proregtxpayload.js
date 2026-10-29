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

    function p2pkh(keyID) {
      return '76a914' + Buffer.from(keyID, 'hex').reverse().toString('hex') + '88ac';
    }

    function expectInvalid(payload, message) {
      expect(function () {
        payload.validate();
      }).to.throw(message);
    }

    function withPayload(name, change, message) {
      var payload = getPayload(name);
      change(payload);
      expectInvalid(payload, message);
    }

    var TWO_PAYOUTS = 'v3 ProRegTx with two payouts';
    var SHARED = 'v3 shared ProRegTx with an explicit reward script';
    var COIN = 100000000;

    it('Should keep supplied v3 fields for validation instead of defaulting them', function () {
      var json = getPayload(TWO_PAYOUTS).toJSON({ network: 'testnet' });
      [
        ['shares', null, 'Expect shares to be an array'],
        ['joinSigs', null, 'Expect shares and joinSigs to be arrays'],
        ['earlyPenalty', null, 'Expect earlyPenalty to be an unsigned integer'],
        ['earlyPeriodBlocks', false, 'Expect earlyPeriodBlocks to be an uint32'],
      ].forEach(function (testCase) {
        var changed = Object.assign({}, json, { [testCase[0]]: testCase[1] });
        expect(function () {
          ProRegTxPayload.fromJSON(changed).validate();
        }).to.throw(testCase[2]);
      });
      var omitted = Object.assign({}, json);
      delete omitted.shares;
      delete omitted.joinSigs;
      delete omitted.earlyPeriodBlocks;
      delete omitted.earlyPenalty;
      expect(ProRegTxPayload.fromJSON(omitted).toBuffer())
        .to.deep.equal(getPayload(TWO_PAYOUTS).toBuffer());
    });

    it('Should require a version from 1 to 3', function () {
      [0, 4].forEach(function (version) {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.version = version;
        }, 'Expect version to be an integer from 1 to 3');
      });
    });

    it('Should allow registering without addresses, but check given ones', function () {
      var payload = getPayload(TWO_PAYOUTS);
      expect(payload.addresses).to.be.deep.equal({});
      payload.validate();

      withPayload(TWO_PAYOUTS, function (payload) {
        payload.addresses = { core_p2p: ['1.2.3.4:9999'], platform_p2p: ['1.2.3.4:26656'] };
      }, 'Expected regular masternode addresses to have no platform entries');
      withPayload('v3 evonode ProRegTx', function (payload) {
        delete payload.addresses.platform_https;
      }, 'Expected evonode addresses to have platform_p2p and platform_https entries');
    });

    it('Should validate every Core vector', function () {
      vectors
        .filter(function (v) {
          return v.coreKey === 'proRegTx';
        })
        .forEach(function (v) {
          new Transaction(v.hex).extraPayload.validate();
        });
    });

    describe('Core checks of every version', function () {
      var V1 = 'v1 ProRegTx';
      var V2_EVO = 'v2 evonode ProRegTx';
      var V3_EVO = 'v3 evonode ProRegTx';

      it('Should reject an unknown version while parsing', function () {
        var raw = Buffer.from(getPayload(TWO_PAYOUTS).toBuffer());
        [0, 4].forEach(function (version) {
          raw.writeUInt16LE(version, 0);
          expect(function () {
            ProRegTxPayload.fromBuffer(raw);
          }).to.throw('Expect version to be an integer from 1 to 3');
        });
      });

      it('Should require a regular or evo type, and evonodes from version 2', function () {
        [V1, V2_EVO, TWO_PAYOUTS].forEach(function (name) {
          withPayload(name, function (payload) {
            payload.type = 2;
          }, 'Expect type to be 0 (regular) or 1 (evo)');
        });
        withPayload(V1, function (payload) {
          payload.type = 1;
        }, 'Expect evonodes to register with version 2 or later');
      });

      it('Should require mode 0', function () {
        [V1, TWO_PAYOUTS].forEach(function (name) {
          withPayload(name, function (payload) {
            payload.mode = 1;
          }, 'Expect mode to be 0');
        });
      });

      it('Should require non-null owner and voting keys of 20 bytes', function () {
        withPayload(V1, function (payload) {
          payload.keyIDOwner = '00'.repeat(20);
        }, 'Expect keyIDOwner to be a non-null 20 byte key id');
        [V1, TWO_PAYOUTS, SHARED].forEach(function (name) {
          withPayload(name, function (payload) {
            payload.keyIDVoting = '00'.repeat(20);
          }, 'Expect keyIDVoting to be a non-null 20 byte key id');
          withPayload(name, function (payload) {
            payload.keyIDVoting = payload.keyIDVoting.slice(2);
          }, 'Expect keyIDVoting to be a non-null 20 byte key id');
        });
      });

      it('Should require a 48 byte operator key and a 32 byte inputsHash', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.pubKeyOperator = payload.pubKeyOperator.slice(2);
        }, 'Expect pubKeyOperator to be 48 bytes in size');
        withPayload(V1, function (payload) {
          payload.inputsHash = payload.inputsHash.slice(2);
        }, 'Expect inputsHash to be a hex string representing sha256 hash');
      });

      it('Should require a non-null platformNodeID for evonodes', function () {
        [V2_EVO, V3_EVO].forEach(function (name) {
          withPayload(name, function (payload) {
            payload.platformNodeID = '00'.repeat(20);
          }, 'Expect platformNodeID to be a non-null 20 byte key id');
        });
      });

      it('Should check the platform ports of a version 2 evonode', function () {
        withPayload(V2_EVO, function (payload) {
          payload.platformP2PPort = 9999;
        }, 'Expect platform ports not to be the mainnet Core port 9999');
        withPayload(V2_EVO, function (payload) {
          payload.platformHTTPPort = payload.platformP2PPort;
        }, 'Expect the platform ports and the Core port to differ');
        withPayload(V2_EVO, function (payload) {
          payload.platformHTTPPort = 19999;
        }, 'Expect the platform ports and the Core port to differ');
      });

      it('Should check a version 1 or 2 payout script like a payout list', function () {
        withPayload(V1, function (payload) {
          payload.scriptPayout = '';
        }, 'Expected payout scriptPayout to be a p2pkh/p2sh');
        withPayload(V1, function (payload) {
          payload.scriptPayout = p2pkh(payload.keyIDOwner);
        }, 'Expect payouts not to pay the owner or voting key');
        withPayload(V1, function (payload) {
          payload.scriptPayout = p2pkh(payload.keyIDVoting);
        }, 'Expect payouts not to pay the owner or voting key');
      });
    });

    describe('payouts', function () {
      it('Should require 1 to 8 payouts', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts = [];
        }, 'Expect payouts to be an array of 1 to 8 payouts');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts = [];
          for (var i = 0; i < 9; i++) {
            payload.payouts.push({
              scriptPayout: '76a914' + ('0' + i).repeat(20) + '88ac',
              reward: i < 8 ? 1100 : 1200,
            });
          }
        }, 'Expect payouts to be an array of 1 to 8 payouts');
      });

      it('Should require rewards from 100 to 10000', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].reward = 9901;
          payload.payouts[1].reward = 99;
        }, 'Expect payout reward to be an integer from 100 to 10000');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].reward = 10001;
        }, 'Expect payout reward to be an integer from 100 to 10000');
      });

      it('Should require rewards adding up to 10000', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[1].reward = 3999;
        }, 'Expect payout rewards to add up to 10000');
      });

      it('Should require p2pkh/p2sh payees', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].scriptPayout = '6a';
        }, 'Expected payout scriptPayout to be a p2pkh/p2sh');
      });

      it('Should reject a p2pkh payee that pushes the key hash with PUSHDATA1', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          // 76a914<hash>88ac becomes 76a94c14<hash>88ac, which Core doesn't accept
          var script = payload.payouts[0].scriptPayout;
          expect(script.slice(0, 6)).to.equal('76a914');
          payload.payouts[0].scriptPayout = '76a94c14' + script.slice(6);
        }, 'Expected payout scriptPayout to be a p2pkh/p2sh');
      });

      it('Should reject a payee script with a trailing hex digit', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].scriptPayout = 'a914' + '11'.repeat(20) + '87' + '0';
        }, 'Expected payout scriptPayout to be a p2pkh/p2sh');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].scriptPayout += '0';
        }, 'Expected payout scriptPayout to be a p2pkh/p2sh');
      });

      it('Should require unique payees', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[1].scriptPayout = payload.payouts[0].scriptPayout;
        }, 'Expect payout scripts to be unique');
        // compared as bytes
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[1].scriptPayout = payload.payouts[0].scriptPayout.toUpperCase();
        }, 'Expect payout scripts to be unique');
      });

      it('Should reject payees paying the owner or voting key', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[0].scriptPayout = p2pkh(payload.keyIDOwner);
        }, 'Expect payouts not to pay the owner or voting key');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.payouts[1].scriptPayout = p2pkh(payload.keyIDVoting);
        }, 'Expect payouts not to pay the owner or voting key');
      });

      it('Should accept a P2SH payee with the hash of a key', function () {
        var payload = getPayload(TWO_PAYOUTS);
        payload.payouts[0].scriptPayout =
          'a914' + Buffer.from(payload.keyIDVoting, 'hex').reverse().toString('hex') + '87';
        payload.validate();
      });

      it('Should require a non-null owner key and no early terms without shares', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.keyIDOwner = '00'.repeat(20);
        }, 'Expect keyIDOwner to be a non-null 20 byte key id');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.earlyPeriodBlocks = 1;
        }, 'Expect no earlyPeriodBlocks or earlyPenalty without shares');
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.earlyPenalty = 1;
        }, 'Expect no earlyPeriodBlocks or earlyPenalty without shares');
      });

      it('Should require a regular or evo type', function () {
        withPayload(TWO_PAYOUTS, function (payload) {
          payload.type = 2;
        }, 'Expect type to be 0 (regular) or 1 (evo)');
      });
    });

    describe('shares', function () {
      it('Should require one 65 byte join signature per share', function () {
        withPayload(SHARED, function (payload) {
          payload.joinSigs.pop();
        }, 'Expect one join signature per share');
        withPayload(SHARED, function (payload) {
          payload.joinSigs[0] = payload.joinSigs[0].slice(2);
        }, 'Expect join signatures to be 65 bytes in size');
      });

      it('Should require the collateral in the registration, a null owner key and no payouts', function () {
        withPayload(SHARED, function (payload) {
          payload.collateralHash = '11'.repeat(32);
        }, 'Expect a shared masternode to have its collateral in the registration');
        withPayload(SHARED, function (payload) {
          payload.keyIDOwner = '11'.repeat(20);
        }, 'Expect a null keyIDOwner for a shared masternode');
        withPayload(SHARED, function (payload) {
          payload.payouts = getPayload(TWO_PAYOUTS).payouts;
        }, 'Expect no payouts for a shared masternode');
      });

      it('Should require 2 to 8 shares', function () {
        withPayload(SHARED, function (payload) {
          payload.shares.pop();
          payload.joinSigs.pop();
        }, 'Expect 2 to 8 shares');
        var eightShares = getPayload('v3 shared ProRegTx with eight shares');
        eightShares.validate();
        eightShares.shares.push(eightShares.shares[0]);
        eightShares.joinSigs.push(eightShares.joinSigs[0]);
        expectInvalid(eightShares, 'Expect 2 to 8 shares');
      });

      it('Should require an early period of at most 420480 blocks', function () {
        withPayload(SHARED, function (payload) {
          payload.earlyPeriodBlocks = 420481;
        }, 'Expect earlyPeriodBlocks to be at most 420480');
      });

      it('Should require amounts from 100 DASH to the collateral', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[0].amount = 100 * COIN - 1;
          payload.shares[1].amount = 900 * COIN + 1;
        }, 'Expect share amount to be from 100 DASH to the masternode collateral');
        withPayload(SHARED, function (payload) {
          payload.shares[0].amount = 1000 * COIN + 1;
        }, 'Expect share amount to be from 100 DASH to the masternode collateral');
        withPayload(SHARED, function (payload) {
          payload.shares[0].amount = -1;
        }, 'Expect share amount to be from 100 DASH to the masternode collateral');
      });

      it('Should require amounts adding up to the collateral of the node type', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[1].amount -= 1;
        }, 'Expect share amounts to add up to the masternode collateral');
        // 1000 DASH is a regular masternode's collateral, not an evonode's
        withPayload(SHARED, function (payload) {
          payload.type = 1;
          payload.platformNodeID = '11'.repeat(20);
          payload.addresses.platform_p2p = ['127.0.0.1:22000'];
          payload.addresses.platform_https = ['127.0.0.1:22001'];
        }, 'Expect share amounts to add up to the masternode collateral');
      });

      it('Should require non-null and unique owner keys', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[0].keyIDOwner = '00'.repeat(20);
        }, 'Expect share keyIDOwner to be a non-null 20 byte key id');
        withPayload(SHARED, function (payload) {
          payload.shares[1].keyIDOwner = payload.shares[0].keyIDOwner;
        }, 'Expect share keyIDOwner to be unique');
        // compared as bytes
        withPayload(SHARED, function (payload) {
          payload.shares[1].keyIDOwner = payload.shares[0].keyIDOwner.toUpperCase();
        }, 'Expect share keyIDOwner to be unique');
      });

      it('Should require unique refund scripts', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[1].scriptRefund = payload.shares[0].scriptRefund;
        }, 'Expect share scriptRefund to be unique');
        // compared as bytes
        withPayload(SHARED, function (payload) {
          payload.shares[1].scriptRefund = payload.shares[0].scriptRefund.toUpperCase();
        }, 'Expect share scriptRefund to be unique');
      });

      it('Should require p2pkh/p2sh share scripts', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[0].scriptRefund = '';
        }, 'Expected share scriptRefund to be a p2pkh/p2sh');
        withPayload(SHARED, function (payload) {
          payload.shares[1].scriptReward = '6a';
        }, 'Expected share scriptReward to be empty or a p2pkh/p2sh');
      });

      it('Should reject share scripts paying the voting key or a share owner key', function () {
        withPayload(SHARED, function (payload) {
          payload.shares[0].scriptRefund = p2pkh(payload.keyIDVoting);
        }, 'Expect share scripts not to pay the voting key or a share owner key');
        withPayload(SHARED, function (payload) {
          payload.shares[1].scriptReward = p2pkh(payload.shares[0].keyIDOwner);
        }, 'Expect share scripts not to pay the voting key or a share owner key');
      });

      it('Should require a penalty below the smallest share, and none without an early period', function () {
        withPayload(SHARED, function (payload) {
          payload.earlyPenalty = 500 * COIN;
        }, 'Expect earlyPenalty to be less than the smallest share');
        withPayload(SHARED, function (payload) {
          payload.earlyPeriodBlocks = 0;
        }, 'Expect no earlyPenalty without an early period');
        var payload = getPayload(SHARED);
        payload.earlyPeriodBlocks = 0;
        payload.earlyPenalty = 0;
        payload.validate();
      });
    });

    describe('JSON fields', function () {
      it('Should reject fields version 3 payloads do not have', function () {
        var json = getPayload('v3 evonode ProRegTx').toJSON({ network: 'testnet' });
        ['service', 'payoutAddress', 'scriptPayout', 'platformP2PPort', 'platformHTTPPort'].forEach(
          function (field) {
            var withField = Object.assign({}, json);
            withField[field] = field === 'platformP2PPort' || field === 'platformHTTPPort' ? 1 : 'x';
            expect(function () {
              ProRegTxPayload.fromJSON(withField);
            }).to.throw('Expect no ' + field + ' in a version 3 payload');
          }
        );
      });

      it('Should reject fields version 1 and 2 payloads do not have', function () {
        var json = proRegTxFixture.getProRegPayloadJSON();
        ['addresses', 'payouts', 'shares', 'joinSigs', 'earlyPeriodBlocks', 'earlyPenalty'].forEach(
          function (field) {
            var withField = Object.assign({}, json);
            withField[field] = field.startsWith('early') ? 0 : [];
            expect(function () {
              ProRegTxPayload.fromJSON(withField);
            }).to.throw('Expect no ' + field + ' in a version 2 payload');
          }
        );
      });
    });
  });

  describe('fields of other versions and node types', function () {
    function withField(json, field, value) {
      var copy = Object.assign({}, json);
      copy[field] = value;
      return copy;
    }

    it('Should reject platform fields of a regular masternode or version 1', function () {
      var json = proRegTxFixture.getProRegPayloadJSON();
      var v1JSON = withField(json, 'version', 1);
      ProRegTxPayload.fromJSON(v1JSON);
      ['platformNodeID', 'platformP2PPort', 'platformHTTPPort'].forEach(function (field) {
        expect(function () {
          ProRegTxPayload.fromJSON(withField(json, field, 1));
        }).to.throw('Expect no ' + field + ' in a regular masternode payload');
        expect(function () {
          ProRegTxPayload.fromJSON(withField(v1JSON, field, 1));
        }).to.throw('Expect no ' + field + ' in a version 1 payload');
      });
    });

    it('Should keep the platform fields of an evonode', function () {
      var vectors = require('../../fixtures/core24-protx.json').transactions;
      ['v2 evonode ProRegTx', 'v3 evonode ProRegTx'].forEach(function (name) {
        var payload = new DashcoreLib.Transaction(
          vectors.find(function (v) {
            return v.name === name;
          }).hex
        ).extraPayload;
        var restored = ProRegTxPayload.fromJSON(payload.toJSON({ network: 'testnet' }));
        expect(restored.platformNodeID).to.be.equal(payload.platformNodeID);
        expect(restored.toBuffer()).to.be.deep.equal(payload.toBuffer());
      });
    });
  });
});
