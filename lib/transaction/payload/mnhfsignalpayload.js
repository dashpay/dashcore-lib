/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
const _ = require('lodash');

var isUnsignedInteger = utils.isUnsignedInteger;

var CURRENT_PAYLOAD_VERSION = 1;

/**
 * @typedef {Object} MnHfSignalPayloadJSON
 * @property {number} version
 * @property {Object} signal
 * @property {number} signal.versionBit
 * @property {string} signal.quorumHash
 * @property {string} signal.sig
 */

/**
 * @class MnHfSignalPayload
 * @property {number} version
 * @property {Object} signal
 * @property {number} signal.versionBit
 * @property {string} signal.quorumHash
 * @property {string} signal.sig
 */
function MnHfSignalPayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
  this.signal = {
    versionBit: 0,
    quorumHash: '',
    sig: ''
  };
}

MnHfSignalPayload.prototype = Object.create(AbstractPayload.prototype);
MnHfSignalPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw payload
 * @param {Buffer} rawPayload
 * @return {MnHfSignalPayload}
 */
MnHfSignalPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new MnHfSignalPayload();

  payload.version = payloadBufferReader.readUInt8();
  payload.signal.versionBit = payloadBufferReader.readUInt8();
  
  // Reverse the quorumHash to correct the byte order (from little-endian to big-endian)
  payload.signal.quorumHash = payloadBufferReader.read(32).toString('hex');
  
  payload.signal.sig = payloadBufferReader.read(96).toString('hex');

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
  }

  payload.validate();
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|MnHfSignalPayloadJSON} payloadJson
 * @return {MnHfSignalPayload}
 */
MnHfSignalPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new MnHfSignalPayload();
  payload.version = payloadJson.version || CURRENT_PAYLOAD_VERSION;
  payload.signal.versionBit = payloadJson.signal.versionBit;
  payload.signal.quorumHash = payloadJson.signal.quorumHash;
  payload.signal.sig = payloadJson.signal.sig;

  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
MnHfSignalPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );

  Preconditions.checkArgument(
    this.version !== 0 && this.version <= CURRENT_PAYLOAD_VERSION,
    'Invalid version'
  );

  Preconditions.checkArgument(
    isUnsignedInteger(this.signal.versionBit) && this.signal.versionBit <= 255,
    'Expect signal.versionBit to be an unsigned 8-bit integer'
  );

  Preconditions.checkArgument(
    utils.isSha256HexString(this.signal.quorumHash),
    'Expect signal.quorumHash to be a valid 32-byte SHA256 hex string'
  );

  Preconditions.checkArgument(
    utils.isHexaString(this.signal.sig) && Buffer.from(this.signal.sig, 'hex').length === 96,
    'Expect signal.sig to be a valid 96-byte hex string'
  );

  return true;
};

/**
 * Serializes payload to JSON
 * @return {MnHfSignalPayloadJSON}
 */
MnHfSignalPayload.prototype.toJSON = function toJSON() {
  this.validate();
  return {
    version: this.version,
    signal: {
      versionBit: this.signal.versionBit,
      quorumHash: this.signal.quorumHash,
      sig: this.signal.sig
    }
  };
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
MnHfSignalPayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt8(this.version);
  payloadBufferWriter.writeUInt8(this.signal.versionBit);
  
  // Reverse the quorumHash to write in little-endian format
  payloadBufferWriter.write(Buffer.from(this.signal.quorumHash, 'hex'));
  
  payloadBufferWriter.write(Buffer.from(this.signal.sig, 'hex'));

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {MnHfSignalPayload}
 */
MnHfSignalPayload.prototype.copy = function copy() {
  return MnHfSignalPayload.fromJSON(this.toJSON());
};

module.exports = MnHfSignalPayload;
