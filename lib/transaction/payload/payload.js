/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var RegisteredPayloadTypes =
  require('../../constants').registeredTransactionTypes;
var AbstractPayload = require('./abstractpayload');
var CoinbasePayload = require('./coinbasepayload');
var CommitmentTxPayload = require('./commitmenttxpayload');
var ProRegTxPayload = require('./proregtxpayload');
var ProTxUpServPayload = require('./proupservtxpayload');
var ProUpRegTxPayload = require('./proupregtxpayload');
var ProUpRevTxPayload = require('./prouprevtxpayload');
var MnHfSignalPayload = require('./mnhfsignalpayload');
var AssetLockPayload = require('./assetlockpayload');
var AssetUnlockPayload = require('./assetunlockpayload');

var PayloadClasses = {};
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_COINBASE] = CoinbasePayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_QUORUM_COMMITMENT] =
  CommitmentTxPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_PROVIDER_REGISTER] =
  ProRegTxPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_PROVIDER_UPDATE_SERVICE] =
  ProTxUpServPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_PROVIDER_UPDATE_REGISTRAR] =
  ProUpRegTxPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_PROVIDER_UPDATE_REVOKE] =
  ProUpRevTxPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_MASTERNODE_HARD_FORK_SIGNAL] =
  MnHfSignalPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_ASSET_LOCK] =
  AssetLockPayload;
PayloadClasses[RegisteredPayloadTypes.TRANSACTION_ASSET_UNLOCK] =
  AssetUnlockPayload;

/**
 *
 * @param {number} payloadType
 * @return {AbstractPayload}
 */
function getPayloadClass(payloadType) {
  var GenericPayload = PayloadClasses[payloadType];
  if (!GenericPayload) {
    throw new Error('Unknown special transaction type');
  }
  return GenericPayload;
}

/**
 * Parses payload and returns instance of payload to work with
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 * @return {AbstractPayload}
 */
function parsePayloadBuffer(payloadType, rawPayload) {
  var Payload = getPayloadClass(payloadType);
  return Payload.fromBuffer(rawPayload);
}

/**
 * @param {Number} payloadType
 * @param {Object} payloadJson
 * @return {AbstractPayload}
 */
function parsePayloadJSON(payloadType, payloadJson) {
  var Payload = getPayloadClass(payloadType);
  return Payload.fromJSON(payloadJson);
}

/**
 * Create an empty instance of payload class
 * @param payloadType
 * @return {AbstractPayload}
 */
function createPayload(payloadType) {
  var Payload = getPayloadClass(payloadType);
  return new Payload();
}

/**
 * Checks if type matches payload
 * @param {number} payloadType
 * @param {AbstractPayload} payload
 * @return {boolean}
 */
function isPayloadMatchesType(payloadType, payload) {
  var GenericPayload = getPayloadClass(payloadType);
  return payload instanceof GenericPayload;
}

/**
 * Serializes payload
 * @param {AbstractPayload} payload
 * @return {Buffer}
 */
function serializePayloadToBuffer(payload) {
  return payload.toBuffer();
}

/**
 * Serializes payload to JSON
 * @param payload
 * @return {Object}
 */
function serializePayloadToJSON(payload) {
  return payload.toJSON();
}

module.exports = {
  parseBuffer: parsePayloadBuffer,
  parseJSON: parsePayloadJSON,
  serializeToBuffer: serializePayloadToBuffer,
  serializeToJSON: serializePayloadToJSON,
  create: createPayload,
  hasCorrectType: isPayloadMatchesType,
};
