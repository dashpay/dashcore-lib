/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var Script = require('../../script');
var utils = require('../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;
var isHexStringOfSize = utils.isHexStringOfSize;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var COMPACT_SIGNATURE_SIZE = constants.COMPACT_SIGNATURE_SIZE;

/**
 * @typedef {Object} ProUpShareTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} shareIndex
 * @property {string} rewardAddress
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 */

/**
 * @class ProUpShareTxPayload
 * @property {number} version uint_16	2	ProUpShareTx version number. Currently set to 1.
 * @property {string} proTxHash uint256	32	The hash of the shared masternode's provider transaction
 * @property {number} shareIndex uint_16	2	Index of the share whose reward script is updated
 * @property {string} scriptReward Script	Variable	New reward script of the share (p2pkh/p2sh)
 * @property {string} inputsHash uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} [payloadSig] vector	Variable	Compact ECDSA signature of the payload hash. Signed by the share owner.
 *
 * @param {ProUpShareTransactionPayloadJSON} [payloadJSON]
 * @constructor
 */
function ProUpShareTxPayload(payloadJSON) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (payloadJSON) {
    if (payloadJSON.version !== undefined) {
      this.version = payloadJSON.version;
    }
    this.proTxHash = payloadJSON.proTxHash;
    this.shareIndex = payloadJSON.shareIndex;
    this.scriptReward = Script.fromAddress(payloadJSON.rewardAddress).toHex();
    this.inputsHash = payloadJSON.inputsHash;
    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }
    this.validate();
  }
}

ProUpShareTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpShareTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parses raw ProUpShareTxPayload payload
 * @param {Buffer} rawPayload
 * @return {ProUpShareTxPayload}
 */
ProUpShareTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpShareTxPayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.proTxHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');
  payload.shareIndex = payloadBufferReader.readUInt16LE();
  var scriptRewardSize = payloadBufferReader.readVarintNum();
  payload.scriptReward = payloadBufferReader
    .read(scriptRewardSize)
    .toString('hex');
  payload.inputsHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');

  var signatureSize = payloadBufferReader.readVarintNum();
  if (signatureSize > 0) {
    payload.payloadSig = payloadBufferReader
      .read(signatureSize)
      .toString('hex');
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
 * Creates new instance of ProUpShareTxPayload payload from JSON
 * @param {string|ProUpShareTransactionPayloadJSON} payloadJSON
 * @return {ProUpShareTxPayload}
 */
ProUpShareTxPayload.fromJSON = function fromJSON(payloadJSON) {
  return new ProUpShareTxPayload(payloadJSON);
};

/* Instance methods */

/**
 * Validates ProUpShareTxPayload payload data
 * @return {boolean}
 */
ProUpShareTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expected version to be an unsigned integer'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isUnsignedInteger(this.shareIndex),
    'Expected shareIndex to be an unsigned integer'
  );
  Preconditions.checkArgument(
    isHexString(this.scriptReward),
    'Expected scriptReward to be a hex string'
  );
  var script = new Script(this.scriptReward);
  Preconditions.checkArgument(
    script.isPublicKeyHashOut() || script.isScriptHashOut(),
    'Expected scriptReward to be a p2pkh/p2sh'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'expected inputsHash to be a sha256 hex string'
  );

  if (this.payloadSig) {
    Preconditions.checkArgument(
      isHexStringOfSize(this.payloadSig, COMPACT_SIGNATURE_SIZE * 2),
      'Expected payloadSig to be a ' +
        COMPACT_SIGNATURE_SIZE +
        '-byte hex string'
    );
  }

  return true;
};

/**
 * Serializes ProUpShareTxPayload payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @param [options.network]
 * @return {ProUpShareTransactionPayloadJSON}
 */
ProUpShareTxPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature =
    Boolean(options && options.skipSignature) || !Boolean(this.payloadSig);
  var network = options && options.network;
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    shareIndex: this.shareIndex,
    rewardAddress: new Script(this.scriptReward)
      .toAddress(network)
      .toString(),
    inputsHash: this.inputsHash,
  };
  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serializes ProUpShareTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - omit the signature, as Core does when
 * hashing the payload for signing
 * @return {Buffer}
 */
ProUpShareTxPayload.prototype.toBuffer = function toBuffer(options) {
  this.validate();
  var scriptRewardBuf = Buffer.from(this.scriptReward, 'hex');
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .writeUInt16LE(this.shareIndex)
    .writeVarintNum(scriptRewardBuf.length)
    .write(scriptRewardBuf)
    .write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (!(options && options.skipSignature)) {
    if (this.payloadSig) {
      var signatureBuf = Buffer.from(this.payloadSig, 'hex');
      payloadBufferWriter.writeVarintNum(signatureBuf.length);
      payloadBufferWriter.write(signatureBuf);
    } else {
      payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
    }
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpShareTxPayload}
 */
ProUpShareTxPayload.prototype.copy = function copy() {
  return ProUpShareTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpShareTxPayload;
