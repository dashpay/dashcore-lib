/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Script = DashcoreLib.Script;
var CommitmentTxPayload = DashcoreLib.Transaction.Payload.CommitmentTxPayload;

var validCommitmentTxPayloadJSON = {
  version: 1,
  height: 279326,
  qfcVersion: 1,
  llmqtype: 1,
  quorumHash: '4cb9568141dded955ed90345b393fc62634be7d260ca328b89afdd0500000000',
  signersSize: 50,
  signers: '00000000000000',
  validMembersSize: 50,
  validMembers: '00000000000000',
  quorumPublicKey: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  quorumVvecHash: '0000000000000000000000000000000000000000000000000000000000000000',
  quorumSig: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  sig: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
};

var validCommitmentTxPayloadHexString = '01001e430400010001f2a1f356b9e086220d38754b1de1e4dcbd8b080c3fa0a62c2bd0961400000000320000000000000032000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
var payload = CommitmentTxPayload.fromBuffer(Buffer.from(validCommitmentTxPayloadHexString, 'hex'));

function checkValidJSON(payload) {
  expect(payload.version).to.be.equal(validCommitmentTxPayloadJSON.version);
  expect(payload.height).to.be.equal(validCommitmentTxPayloadJSON.height);
  expect(payload.qfcVersion).to.be.equal(validCommitmentTxPayloadJSON.qfcVersion);
  expect(payload.version).to.be.equal(validCommitmentTxPayloadJSON.version);
  expect(payload.llmqtype).to.be.equal(validCommitmentTxPayloadJSON.llmqtype);
  expect(payload.quorumHash).to.be.equal(validCommitmentTxPayloadJSON.quorumHash);
  expect(payload.signers).to.be.equal(validCommitmentTxPayloadJSON.signers);
  expect(payload.validMembers).to.be.equal(validCommitmentTxPayloadJSON.validMembers);
  expect(payload.quorumPublicKey).to.be.equal(validCommitmentTxPayloadJSON.quorumPublicKey);
  expect(payload.quorumVvecHash).to.be.equal(validCommitmentTxPayloadJSON.quorumVvecHash);
  expect(payload.quorumSig).to.be.equal(validCommitmentTxPayloadJSON.quorumSig);
  expect(payload.sig).to.be.equal(validCommitmentTxPayloadJSON.sig);
}

describe('CommitmentTxPayload', function () {

  var payload = null;
  var payloadBuffer = null;

  describe('.fromJSON', function () {

    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should return instance of CommitmentTxPayload and call #validate on it', function () {
      payload = CommitmentTxPayload.fromJSON(validCommitmentTxPayloadJSON);
      checkValidJSON(payload);
    });
  });

  describe('.toBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    it('Should return payload buffer of specific length', function () {

      //Manually calculated from validCommitmentTxPayloadJSON
      var expectedBufferLength = 329;

      payloadBuffer = payload.toBuffer();
      expect(payloadBuffer.length).to.be.equal(expectedBufferLength);
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    })
  });

  describe('.fromBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    it('Should return payload from buffer', function () {
      var payloadFromBuffer = CommitmentTxPayload.fromBuffer(payloadBuffer);
      checkValidJSON(payloadFromBuffer);
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    })
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payloadJSON = payload.toJSON();
      checkValidJSON(payloadJSON);
    });
  });
});
