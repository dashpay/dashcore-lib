/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;

/**
 * @typedef {Object} ProUpRevTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} reason
 * @property {string} inputsHash
 * @property {string} payloadSig
 */

/**
 * @class ProUpRevTxPayload
 * @property {number} version uint_16	2	ProUpRevTx version number. Currently set to 1.
 * @property {string} proTxHash uint256	32	The hash of the provider transaction
 * @property {number} reason uint_16	2	The reason for revoking the key.
 * @property {string} inputsHash uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} payloadSig BLSSig Signature of the hash of the ProTx fields. Signed by the Operator.
 */
function ProUpRevTxPayload(payloadJSON) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (payloadJSON) {
    this.proTxHash = payloadJSON.proTxHash;
    this.reason = payloadJSON.reason;
    this.inputsHash = payloadJSON.inputsHash;
    this.payloadSigSize = payloadJSON.payloadSigSize;

    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }

    this.validate();
  }
}

ProUpRevTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpRevTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serializes ProUpRevTxPayload payload
 * @param {ProUpRevTransactionPayloadJSON} transitionPayloadJSON
 * @return {Buffer} serialized payload
 */
ProUpRevTxPayload.serializeJSONToBuffer = function (transitionPayloadJSON) {
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(transitionPayloadJSON.version)
    .write(Buffer.from(transitionPayloadJSON.proTxHash, 'hex').reverse())
    .writeUInt16LE(transitionPayloadJSON.reason)
    .write(Buffer.from(transitionPayloadJSON.inputsHash, 'hex'));

  if (transitionPayloadJSON.payloadSig) {
    var signatureBuf = Buffer.from(transitionPayloadJSON.payloadSig, 'hex');
    payloadBufferWriter.write(signatureBuf);
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Parses raw ProUpRevTxPayload payload
 * @param {Buffer} rawPayloadBuffer
 * @return {ProUpRevTxPayload}
 */
ProUpRevTxPayload.fromBuffer = function (rawPayloadBuffer) {
  var payloadBufferReader = new BufferReader(rawPayloadBuffer);
  var payload = new ProUpRevTxPayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.proTxHash = payloadBufferReader
    .read(HASH_SIZE)
    .reverse()
    .toString('hex');
  payload.reason = payloadBufferReader.readUInt16LE();
  payload.inputsHash = payloadBufferReader
    .read(HASH_SIZE)
    .reverse()
    .toString('hex');
  payload.payloadSig = payloadBufferReader
    .read(constants.BLS_SIGNATURE_SIZE)
    .toString('hex');

  if (!payloadBufferReader.finished()) {
    throw new Error(
      'Failed to parse payload: raw payload is bigger than expected.'
    );
  }

  payload.validate();

  return payload;
};

/**
 * Creates new instance of ProUpRevTxPayload payload from JSON
 * @param {string|ProUpRevTransactionPayloadJSON} payloadJSON
 * @return {ProUpRevTxPayload}
 */
ProUpRevTxPayload.fromJSON = function fromJSON(payloadJSON) {
  return new ProUpRevTxPayload(payloadJSON);
};

/* Instance methods */

/**
 * Validates ProUpRevTxPayload payload data
 * @return {boolean}
 */
ProUpRevTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expected version to be an unsigned integer'
  );

  Preconditions.checkArgument(
    isUnsignedInteger(this.reason),
    'Expected reason to be an unsigned integer'
  );

  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'expected inputsHash to be a sha246 hex string'
  );

  if (this.payloadSig) {
    Preconditions.checkArgument(
      isHexString(this.payloadSig),
      'expected payloadSig to be a hex string'
    );
    Preconditions.checkArgument(
      this.payloadSig.length === constants.BLS_SIGNATURE_SIZE * 2,
      'Invalid payloadSig size'
    );
  }

  return true;
};

/**
 * Serializes ProUpRevTxPayload payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {ProUpRevTransactionPayloadJSON}
 */
ProUpRevTxPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature =
    Boolean(options && options.skipSignature) || !Boolean(this.payloadSig);
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    reason: this.reason,
    inputsHash: this.inputsHash,
  };
  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serializes ProUpRevTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
ProUpRevTxPayload.prototype.toBuffer = function toBuffer(options) {
  this.validate();
  var skipSignature =
    Boolean(options && options.skipSignature) || !Boolean(this.payloadSig);

  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .writeUInt16LE(this.reason)
    .write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (!skipSignature) {
    var signatureBuf = Buffer.from(this.payloadSig, 'hex');
    payloadBufferWriter.write(signatureBuf);
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpRevTxPayload}
 */
ProUpRevTxPayload.prototype.copy = function copy() {
  return ProUpRevTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpRevTxPayload;
