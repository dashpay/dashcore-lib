/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var sinon = require('sinon');

var DashcoreLib = require('../../../index');

var Transaction = DashcoreLib.Transaction;
var CommitmentTxPayload = DashcoreLib.Transaction.Payload.CommitmentTxPayload;

var validCommitmentTxPayloadJSON = {
  version: 1,
  height: 137051,
  qfcVersion: 1,
  llmqtype: 1,
  quorumHash:
    'f015624411254dd5a806e16310e7b9989e8224796f57e42bfb01420200000000',
  signersSize: 50,
  signers: 'ffffffffffff03',
  validMembersSize: 50,
  validMembers: 'ffffffffffff03',
  quorumPublicKey:
    '0ea4465cc4b2e6890e5bd37987822cabf1b79ec8dece016a3be75802482480af29f7961281405d2cb3d6e38157bda824',
  quorumVvecHash:
    'e3107d64e8d2bec7dff1f6d7fd1a9d31a181c82acaf052f8d27b71507fe2db12',
  quorumSig:
    '0f0a203004f025076c7c0d989464013b31a0104155946968317e6abcfafbe70a53c2b57811f0ebe888cef36eacf649401497c569a9f617c3eeaa7eacbc45969389fa229355097abe277f2452792a5f2e84e804bf2eac0843f01690fb6bd10df1',
  sig: '195f7a49aed846bcf475a4a3500b15a626c514c9223b46ce6fef505f19af8f8e1cec554cb63a04125c2d19bf0211ea4c15f289f1413b8618abdf7295e44fb196e326a803d9d7c7c69a12314cf88e463653fde5fecb1f8c3d6791180cdc382392',
};

var testNetPayloadHex =
  '01005b170200010001f015624411254dd5a806e16310e7b9989e8224796f57e42bfb0142020000000032ffffffffffff0332ffffffffffff030ea4465cc4b2e6890e5bd37987822cabf1b79ec8dece016a3be75802482480af29f7961281405d2cb3d6e38157bda824e3107d64e8d2bec7dff1f6d7fd1a9d31a181c82acaf052f8d27b71507fe2db120f0a203004f025076c7c0d989464013b31a0104155946968317e6abcfafbe70a53c2b57811f0ebe888cef36eacf649401497c569a9f617c3eeaa7eacbc45969389fa229355097abe277f2452792a5f2e84e804bf2eac0843f01690fb6bd10df1195f7a49aed846bcf475a4a3500b15a626c514c9223b46ce6fef505f19af8f8e1cec554cb63a04125c2d19bf0211ea4c15f289f1413b8618abdf7295e44fb196e326a803d9d7c7c69a12314cf88e463653fde5fecb1f8c3d6791180cdc382392';
var testNetCommitmentTxHex =
  '03000600000000000000fd490101005b170200010001f015624411254dd5a806e16310e7b9989e8224796f57e42bfb0142020000000032ffffffffffff0332ffffffffffff030ea4465cc4b2e6890e5bd37987822cabf1b79ec8dece016a3be75802482480af29f7961281405d2cb3d6e38157bda824e3107d64e8d2bec7dff1f6d7fd1a9d31a181c82acaf052f8d27b71507fe2db120f0a203004f025076c7c0d989464013b31a0104155946968317e6abcfafbe70a53c2b57811f0ebe888cef36eacf649401497c569a9f617c3eeaa7eacbc45969389fa229355097abe277f2452792a5f2e84e804bf2eac0843f01690fb6bd10df1195f7a49aed846bcf475a4a3500b15a626c514c9223b46ce6fef505f19af8f8e1cec554cb63a04125c2d19bf0211ea4c15f289f1413b8618abdf7295e44fb196e326a803d9d7c7c69a12314cf88e463653fde5fecb1f8c3d6791180cdc382392';
var testNetCommitmentTxHash =
  'cf4b01ce796a4f37e6af6dd62671b608160d4a39acf3bfe95f9a59d1854b63f3';

function getPayloadBuffer() {
  return Buffer.from(testNetPayloadHex, 'hex');
}

function checkValidJSON(payload) {
  expect(payload.version).to.be.equal(validCommitmentTxPayloadJSON.version);
  expect(payload.height).to.be.equal(validCommitmentTxPayloadJSON.height);
  expect(payload.qfcVersion).to.be.equal(
    validCommitmentTxPayloadJSON.qfcVersion
  );
  expect(payload.version).to.be.equal(validCommitmentTxPayloadJSON.version);
  expect(payload.llmqtype).to.be.equal(validCommitmentTxPayloadJSON.llmqtype);
  expect(payload.quorumHash).to.be.equal(
    validCommitmentTxPayloadJSON.quorumHash
  );
  expect(payload.signers).to.be.equal(validCommitmentTxPayloadJSON.signers);
  expect(payload.validMembers).to.be.equal(
    validCommitmentTxPayloadJSON.validMembers
  );
  expect(payload.quorumPublicKey).to.be.equal(
    validCommitmentTxPayloadJSON.quorumPublicKey
  );
  expect(payload.quorumVvecHash).to.be.equal(
    validCommitmentTxPayloadJSON.quorumVvecHash
  );
  expect(payload.quorumSig).to.be.equal(validCommitmentTxPayloadJSON.quorumSig);
  expect(payload.sig).to.be.equal(validCommitmentTxPayloadJSON.sig);
}

describe('CommitmentTxPayload', function () {
  describe('.fromJSON', function () {
    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should return instance of CommitmentTxPayload and call #validate on it', function () {
      var payload = CommitmentTxPayload.fromJSON(validCommitmentTxPayloadJSON);
      checkValidJSON(payload);
    });
  });

  describe('.toBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should return payload buffer of specific length', function () {
      var payload = CommitmentTxPayload.fromBuffer(getPayloadBuffer());
      //Manually calculated from validCommitmentTxPayloadJSON
      var expectedBufferLength = getPayloadBuffer().length;

      var payloadBuffer = payload.toBuffer();
      expect(payloadBuffer.length).to.be.equal(expectedBufferLength);
    });
  });

  describe('.fromBuffer', function () {
    before(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    after(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should return payload from buffer', function () {
      var payloadFromBuffer = CommitmentTxPayload.fromBuffer(
        getPayloadBuffer()
      );
      checkValidJSON(payloadFromBuffer);
    });
  });

  describe('#toJSON', function () {
    beforeEach(function () {
      sinon.spy(CommitmentTxPayload.prototype, 'validate');
    });

    afterEach(function () {
      CommitmentTxPayload.prototype.validate.restore();
    });

    it('Should be able to serialize payload JSON', function () {
      var payload = CommitmentTxPayload.fromBuffer(getPayloadBuffer());
      var payloadJSON = payload.toJSON();
      checkValidJSON(payloadJSON);
    });
  });

  describe('#toString', function () {
    it('Should serizlize to the same hex string', function () {
      var expectedCommitementHex =
        '03000600000000000000fd3d01010009020000010064b5fc275d292adda4e5c454e93f4bc47d2c77975fb0d06bb07bd6bada068bdf0c050005000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
      var parsed = new Transaction(expectedCommitementHex);

      var actualCommitementHex = parsed.toString();
      expect(actualCommitementHex).to.be.equal(expectedCommitementHex);

      var testnetParsedTransaction = new Transaction(testNetCommitmentTxHex);
      var ped = testnetParsedTransaction.extraPayload.toJSON();
      expect(testnetParsedTransaction.toString()).to.be.equal(
        testNetCommitmentTxHex
      );
      expect(testnetParsedTransaction.hash).to.be.equal(
        testNetCommitmentTxHash
      );
    });
  });
});
