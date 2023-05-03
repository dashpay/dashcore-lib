/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var BN = require('../../crypto/bn');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;

/**
 * @typedef {Object} CoinbasePayloadJSON
 * @property {number} version
 * @property {number} height
 * @property {string} merkleRootMNList
 * @property {string} merkleRootQuorums
 * @property {number} bestCLHeight
 * @property {Buffer} bestCLSignature
 * @property {number} assetLockedAmount
 */

/**
 * @class CoinbasePayload
 * @property {number} version
 * @property {number} height
 * @property {string} merkleRootMNList
 * @property {string} merkleRootQuorums
 * @property {number} bestCLHeight
 * @property {Buffer} bestCLSignature
 * @property {number} assetLockedAmount
 */
function CoinbasePayload() {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
}

CoinbasePayload.prototype = Object.create(AbstractPayload.prototype);
CoinbasePayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {CoinbasePayload}
 */
CoinbasePayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new CoinbasePayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.height = payloadBufferReader.readUInt32LE();
  payload.merkleRootMNList = payloadBufferReader
    .read(HASH_SIZE)
    .reverse()
    .toString('hex');
  if (payload.version >= 2) {
    payload.merkleRootQuorums = payloadBufferReader
      .read(HASH_SIZE)
      .reverse()
      .toString('hex');
  }

  if (payload.version >= 3) {
    payload.bestCLHeight = payloadBufferReader.readVarintNum();
    payload.bestCLSignature = payloadBufferReader.read(96);
    payload.assetLockedAmount = payloadBufferReader.readUInt64LEBN();
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
 * @param {string|CoinbasePayloadJSON} payloadJson
 * @return {CoinbasePayload}
 */
CoinbasePayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new CoinbasePayload();
  payload.version = payloadJson.version;
  payload.height = payloadJson.height;
  payload.merkleRootMNList = payloadJson.merkleRootMNList;
  if (payload.version >= 2) {
    payload.merkleRootQuorums = payloadJson.merkleRootQuorums;
  }

  if (payload.version >= 3) {
    payload.bestCLHeight = payloadJson.bestCLHeight;
    payload.bestCLSignature = Buffer.from(payloadJson.bestCLSignature, 'hex');
    payload.assetLockedAmount = payloadJson.assetLockedAmount;
  }

  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
CoinbasePayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );
  Preconditions.checkArgument(
    isUnsignedInteger(this.height),
    'Expect height to be an unsigned integer'
  );
  Preconditions.checkArgument(
    isHexString(this.merkleRootMNList),
    'expect merkleRootMNList to be a hex string but got ' +
      typeof this.merkleRootMNList
  );
  Preconditions.checkArgument(
    this.merkleRootMNList.length === constants.SHA256_HASH_SIZE * 2,
    'Invalid merkleRootMNList size'
  );
  if (this.version >= 2) {
    Preconditions.checkArgument(
      isHexString(this.merkleRootQuorums),
      'expect merkleRootQuorums to be a hex string but got ' +
        typeof this.merkleRootQuorums
    );
    Preconditions.checkArgument(
      this.merkleRootQuorums.length === constants.SHA256_HASH_SIZE * 2,
      'Invalid merkleRootQuorums size'
    );
  }
  if (this.version >= 3) {
    Preconditions.checkArgument(
      isUnsignedInteger(this.bestCLHeight),
      'Expect bestCLHeight to be an unsigned integer'
    );
    Preconditions.checkArgument(
      Buffer.isBuffer(this.bestCLSignature),
      'Expect bestCLSignature to be a buffer'
    );
    Preconditions.checkArgument(
      this.bestCLSignature.length === 96,
      'Invalid bestCLSignature size'
    );
    Preconditions.checkArgument(
      BN.isBN(this.assetLockedAmount),
      'Expect assetLockedAmount to be an instance of BN'
    );
    Preconditions.checkArgument(
      isUnsignedInteger(this.assetLockedAmount.toNumber()),
      'Expect assetLockedAmount to be an unsigned integer'
    );
  }
  return true;
};

/**
 * Serializes payload to JSON
 * @return {CoinbasePayloadJSON}
 */
CoinbasePayload.prototype.toJSON = function toJSON() {
  this.validate();
  var json = {
    version: this.version,
    height: this.height,
    merkleRootMNList: this.merkleRootMNList,
  };
  if (this.version >= 2) {
    json.merkleRootQuorums = this.merkleRootQuorums;
  }
  if (this.version >= 3) {
    json.bestCLHeight = this.bestCLHeight;
    json.bestCLSignature = this.bestCLSignature.toString('hex');
    json.assetLockedAmount = this.assetLockedAmount;
  }
  return json;
};

/**
 * Serialize payload to buffer
 * @return {Buffer}
 */
CoinbasePayload.prototype.toBuffer = function toBuffer() {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt32LE(this.height)
    .write(Buffer.from(this.merkleRootMNList, 'hex').reverse());

  if (this.version >= 2) {
    payloadBufferWriter.write(
      Buffer.from(this.merkleRootQuorums, 'hex').reverse()
    );
  }

  if (this.version >= 3) {
    payloadBufferWriter.writeVarintNum(this.bestCLHeight);
    payloadBufferWriter.write(this.bestCLSignature);
    payloadBufferWriter.writeUInt64LEBN(new BN(this.assetLockedAmount));
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {CoinbasePayload}
 */
CoinbasePayload.prototype.copy = function copy() {
  return CoinbasePayload.fromJSON(this.toJSON());
};

module.exports = CoinbasePayload;
