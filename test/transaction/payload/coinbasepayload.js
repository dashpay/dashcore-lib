/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var BN = require('../../../lib/crypto/bn');

var CoinbasePayload = DashcoreLib.Transaction.Payload.CoinbasePayload;

var merkleRootMNList =
  'a1d4f77f5c85a9d56293878edda45ba6fb3e433e6b9bc278c0f4c5799748b975';
var merkleRootQuorums =
  '9491099bb93b789d8628acce8f8a84c0f4af8196d3dd6c2427aca0ee702fcc90';
var bestCLHeight = 42;
var bestCLSignature = Buffer.alloc(96, 1);
var assetLockedAmount = new BN(1000);

var validCoinbasePayloadJSON = {
  version: 3,
  height: 80672,
  merkleRootMNList: merkleRootMNList,
  merkleRootQuorums: merkleRootQuorums,
  bestCLHeight: bestCLHeight,
  bestCLSignature: bestCLSignature,
  assetLockedAmount: assetLockedAmount,
};
// Contains same data as JSON above
// 0200 is 16-bit unsigned 2, 203b0100 is 32 bit unsigned 80672, everything else is a hash.
var validCoinbasePayload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);
var validCoinbasePayloadBuffer = validCoinbasePayload.toBuffer();
var validCoinbasePayloadHexString = validCoinbasePayloadBuffer.toString('hex');

describe('CoinbasePayload', function () {
  describe('.fromBuffer', function () {
    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should return instance of CoinbasePayload and call #validate on it', function () {
      var payload = CoinbasePayload.fromBuffer(validCoinbasePayloadBuffer);

      expect(payload).to.be.an.instanceOf(CoinbasePayload);
      expect(payload.version).to.be.equal(3);
      expect(payload.height).to.be.equal(80672);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.merkleRootQuorums).to.be.equal(merkleRootQuorums);
      expect(payload.bestCLHeight).to.be.equal(bestCLHeight);
      expect(payload.bestCLSignature).to.be.deep.equal(bestCLSignature);
      expect(payload.assetLockedAmount).to.be.deep.equal(assetLockedAmount);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    it('Should throw in case if there is some unexpected information in raw payload', function () {
      var payloadWithAdditionalZeros = Buffer.from(
        validCoinbasePayloadHexString + '0000',
        'hex'
      );

      expect(function () {
        CoinbasePayload.fromBuffer(payloadWithAdditionalZeros);
      }).to.throw(
        'Failed to parse payload: raw payload is bigger than expected.'
      );
    });
  });

  describe('.fromJSON', function () {
    before(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    it('Should return instance of CoinbasePayload and call #validate on it', function () {
      var payload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);

      expect(payload).to.be.an.instanceOf(CoinbasePayload);
      expect(payload.version).to.be.equal(3);
      expect(payload.height).to.be.equal(80672);
      expect(payload.merkleRootMNList).to.be.equal(merkleRootMNList);
      expect(payload.bestCLHeight).to.be.equal(bestCLHeight);
      expect(payload.bestCLSignature).to.be.deep.equal(bestCLSignature);
      expect(payload.assetLockedAmount).to.be.deep.equal(assetLockedAmount);
      expect(payload.validate.callCount).to.be.equal(1);
    });

    after(function () {
      CoinbasePayload.prototype.validate.restore();
    });
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as version', function () {
      var payload = validCoinbasePayload.copy();

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
    it('Should allow only unsigned integer as height', function () {
      var payload = validCoinbasePayload.copy();

      payload.height = -1;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect height to be an unsigned integer');

      payload.height = 123;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });
    it('Should allow only sha256 hash as merkleRootMNList', function () {
      var payload = validCoinbasePayload.copy();

      payload.merkleRootMNList = -1;

      expect(function () {
        payload.validate();
      }).to.throw(
        'Invalid Argument: expect merkleRootMNList to be a hex string'
      );

      payload.merkleRootMNList = 1.5;

      expect(function () {
        payload.validate();
      }).to.throw(
        'Invalid Argument: expect merkleRootMNList to be a hex string'
      );

      payload.merkleRootMNList = '12';

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Invalid merkleRootMNList size');

      payload.merkleRootMNList = Buffer.from('0a0f', 'hex');

      expect(function () {
        payload.validate();
      }).to.throw(
        'Invalid Argument: expect merkleRootMNList to be a hex string'
      );

      payload.merkleRootMNList = merkleRootMNList;

      expect(function () {
        payload.validate();
      }).not.to.throw;
    });
    it('Should allow only sha256 hash as merkleRootQuorums', function () {
      var payload = validCoinbasePayload.copy();

      if (payload.version >= 2) {
        payload.merkleRootQuorums = -1;

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: expect merkleRootQuorums to be a hex string'
        );

        payload.merkleRootQuorums = 1.5;

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: expect merkleRootQuorums to be a hex string'
        );

        payload.merkleRootQuorums = '12';

        expect(function () {
          payload.validate();
        }).to.throw('Invalid Argument: Invalid merkleRootQuorums size');

        payload.merkleRootQuorums = Buffer.from('0a0f', 'hex');

        expect(function () {
          payload.validate();
        }).to.throw(
          'Invalid Argument: expect merkleRootQuorums to be a hex string'
        );

        payload.merkleRootQuorums = merkleRootMNList;

        expect(function () {
          payload.validate();
        }).not.to.throw;
      }
    });
    it('Should allow only unsigned integer as bestCLHeight', function () {
      var payload = validCoinbasePayload.copy();

      payload.bestCLHeight = -10;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect bestCLHeight to be an unsigned integer');
    });
    it('Should allow only 96 bytes as bestCLSignature', function () {
      var payload = validCoinbasePayload.copy();

      payload.bestCLSignature = Buffer.alloc(95, 1);

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Invalid bestCLSignature size');
    });
    it('Should allow only BN as assetLockedAmount', function () {
      var payload = validCoinbasePayload.copy();

      payload.assetLockedAmount = 10;

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect assetLockedAmount to be an instance of BN');
    });
    it('Should allow only unsigned integer as assetLockedAmount', function () {
      var payload = validCoinbasePayload.copy();

      payload.assetLockedAmount = new BN(-10);

      expect(function () {
        payload.validate();
      }).to.throw('Invalid Argument: Expect assetLockedAmount to be an unsigned integer');
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = validCoinbasePayload.copy();

      var payloadJSON = payload.toJSON();

      expect(payloadJSON.version).to.be.equal(payload.version);
      expect(payloadJSON.height).to.be.equal(payload.height);
      expect(payloadJSON.merkleRootMNList).to.be.equal(
        payload.merkleRootMNList
      );
      expect(payloadJSON.bestCLHeight).to.be.equal(payload.bestCLHeight);
      expect(payloadJSON.bestCLSignature).to.be.equal(payload.bestCLSignature.toString('hex'));
      expect(payloadJSON.assetLockedAmount).to.be.deep.equal(
        payload.assetLockedAmount
      );
    });
    it('Should call #validate', function () {
      var payload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);
      CoinbasePayload.prototype.validate.resetHistory();
      payload.toJSON();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });

  describe('#toBuffer', function () {
    beforeEach(function () {
      sinon.spy(CoinbasePayload.prototype, 'validate');
    });

    afterEach(function () {
      CoinbasePayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload to Buffer', function () {
      var payload = validCoinbasePayload.copy();

      var serializedPayload = payload.toBuffer();
      var restoredPayload = CoinbasePayload.fromBuffer(serializedPayload);

      expect(restoredPayload.version).to.be.equal(payload.version);
      expect(restoredPayload.height).to.be.equal(payload.height);
      expect(restoredPayload.merkleRootMNList).to.be.equal(
        payload.merkleRootMNList
      );
      expect(restoredPayload.bestCLHeight).to.be.equal(payload.bestCLHeight);
      expect(restoredPayload.bestCLSignature).to.be.deep.equal(
        payload.bestCLSignature
      );
      expect(restoredPayload.assetLockedAmount).to.be.deep.equal(
        payload.assetLockedAmount
      );
    });
    it('Should call #validate', function () {
      var payload = CoinbasePayload.fromJSON(validCoinbasePayloadJSON);
      CoinbasePayload.prototype.validate.resetHistory();
      payload.toBuffer();
      expect(payload.validate.callCount).to.be.equal(1);
    });
  });
});
