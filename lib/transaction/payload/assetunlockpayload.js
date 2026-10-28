/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
const _ = require('lodash');
const BN = require('../../crypto/bn');
const constants = require('../../constants');

var isUnsignedInteger = utils.isUnsignedInteger;

// New payloads default to version 1: version 2 is only valid once Core V24 is active
var CURRENT_PAYLOAD_VERSION = 1;
// Version 2 (Core V24) serializes like version 1, but the transaction id excludes
// requestHeight, quorumHash and quorumSig (see Transaction#isAssetUnlockWithStableTxid)
var MAX_PAYLOAD_VERSION = 2;

/**
 * @typedef {Object} AssetUnlockPayloadJSON
 * @property {number} version
 * @property {object} creditOutputs
 */

/**
 * @class AssetUnlockPayload
 * @property {Output[]} creditOutputs
 */
function AssetUnlockPayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
}

AssetUnlockPayload.prototype = Object.create(AbstractPayload.prototype);
AssetUnlockPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {AssetUnlockPayload}
 */
AssetUnlockPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new AssetUnlockPayload();
  payload.version = payloadBufferReader.readUInt8();
  payload.index = payloadBufferReader.readUInt64LEBN().toNumber();
  payload.fee = payloadBufferReader.readUInt32LE();
  payload.requestHeight = payloadBufferReader.readUInt32LE();
  payload.quorumHash = payloadBufferReader
    .read(constants.SHA256_HASH_SIZE)
    .toString('hex');
  payload.quorumSig = payloadBufferReader
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
 * Create new instance of payload from JSON
 * @param {string|AssetUnlockPayloadJSON} payloadJson
 * @return {AssetUnlockPayload}
 */
AssetUnlockPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new AssetUnlockPayload();
  payload.version = payloadJson.version;
  payload.index = payloadJson.index;
  payload.fee = payloadJson.fee;
  payload.requestHeight = payloadJson.requestHeight;
  payload.quorumHash = payloadJson.quorumHash;
  payload.quorumSig = payloadJson.quorumSig;

  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
AssetUnlockPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );

  Preconditions.checkArgument(
    this.version !== 0 && this.version <= MAX_PAYLOAD_VERSION,
    'Invalid version'
  );

  Preconditions.checkArgument(
    isUnsignedInteger(this.index),
    `Expect index to be an unsigned integer`
  );

  Preconditions.checkArgument(
    isUnsignedInteger(this.fee),
    `Expect fee to be an unsigned integer`
  );

  Preconditions.checkArgument(
    isUnsignedInteger(this.requestHeight),
    `Expect requestHeight to be an unsigned integer`
  );

  Preconditions.checkArgument(
    utils.isHexaString(this.quorumHash),
    'Expect quorumHash to be a hex string'
  );

  Preconditions.checkArgument(
    utils.isHexaString(this.quorumSig),
    'Expect quorumSig to be a hex string'
  );

  return true;
};

/**
 * Serializes payload to JSON
 * @return {AssetUnlockPayloadJSON}
 */
AssetUnlockPayload.prototype.toJSON = function toJSON() {
  this.validate();
  var json = {
    version: this.version,
    index: this.index,
    fee: this.fee,
    requestHeight: this.requestHeight,
    quorumHash: this.quorumHash,
    quorumSig: this.quorumSig,
  };

  return json;
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
AssetUnlockPayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt8(this.version)
    .writeUInt64LEBN(new BN(this.index))
    .writeUInt32LE(this.fee)
    .writeUInt32LE(this.requestHeight)
    .write(Buffer.from(this.quorumHash, 'hex'))
    .write(Buffer.from(this.quorumSig, 'hex'));

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {AssetUnlockPayload}
 */
AssetUnlockPayload.prototype.copy = function copy() {
  return AssetUnlockPayload.fromJSON(this.toJSON());
};

module.exports = AssetUnlockPayload;
