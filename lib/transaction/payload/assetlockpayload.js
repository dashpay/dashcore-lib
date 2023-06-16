/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
const _ = require('lodash');
const Output = require('../output');

var isUnsignedInteger = utils.isUnsignedInteger;

var CURRENT_PAYLOAD_VERSION = 1;

/**
 * @typedef {Object} AssetLockPayloadJSON
 * @property {number} version
 * @property {object} creditOutputs
 */

/**
 * @class AssetLockPayload
 * @property {Output[]} creditOutputs
 */
function AssetLockPayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
  this.creditOutputs = [];
}

AssetLockPayload.prototype = Object.create(AbstractPayload.prototype);
AssetLockPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {AssetLockPayload}
 */
AssetLockPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new AssetLockPayload();
  payload.version = payloadBufferReader.readUInt8();
  var numCreditOutputs = payloadBufferReader.readVarintNum();
  for (var i = 0; i < numCreditOutputs; i++) {
    payload.creditOutputs.push(Output.fromBufferReader(payloadBufferReader));
  }

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
 * @param {string|AssetLockPayloadJSON} payloadJson
 * @return {AssetLockPayload}
 */
AssetLockPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new AssetLockPayload();
  payload.version = payloadJson.version;

  var creditOutputs = [];
  _.each(payloadJson.creditOutputs, function (output) {
    creditOutputs.push(new Output(output));
  });

  payload.creditOutputs = creditOutputs;

  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
AssetLockPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );

  Preconditions.checkArgument(
    this.version !== 0 && this.version <= CURRENT_PAYLOAD_VERSION,
    'Invalid version'
  );

  Preconditions.checkArgument(
    this.creditOutputs.length > 0,
    'Empty credit outputs'
  );

  _.each(this.creditOutputs, function (output, index) {
    Preconditions.checkArgument(
      output instanceof Output,
      'Credit output ' + index + ' is not an instance of Output'
    );
  });

  _.each(this.creditOutputs, function (output, index) {
    Preconditions.checkArgument(
      output.script.isPublicKeyHashOut(),
      'Credit output ' + index + ' is not P2PKH'
    );
  });

  _.each(this.creditOutputs, function (output, index) {
    Preconditions.checkArgument(
      output.script.isPublicKeyHashOut(),
      'Credit output ' + index + ' is not P2PKH'
    );
  });

  return true;
};

/**
 * Serializes payload to JSON
 * @return {AssetLockPayloadJSON}
 */
AssetLockPayload.prototype.toJSON = function toJSON() {
  this.validate();
  const creditOutputs = [];
  _.each(this.creditOutputs, function (output) {
    creditOutputs.push(output.toJSON());
  });
  var json = {
    version: this.version,
    creditOutputs
  };

  return json;
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
AssetLockPayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt8(this.version)
    .writeVarintNum(this.creditOutputs.length);

  _.each(this.creditOutputs, function (output) {
    output.toBufferWriter(payloadBufferWriter);
  });

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {AssetLockPayload}
 */
AssetLockPayload.prototype.copy = function copy() {
  return AssetLockPayload.fromJSON(this.toJSON());
};

module.exports = AssetLockPayload;
