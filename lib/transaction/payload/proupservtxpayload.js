/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var Script = require('../../script');
var ipUtils = require('../../util/ip');
const { MASTERNODE_TYPE_HP,
  PLATFORM_NODE_ID_SIZE
} = require("../../constants");

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var BLSSIG_SIZE = constants.BLS_SIGNATURE_SIZE;

/**
 * @typedef {Object} ProUpServTxPayloadJSON
 * @property {number} version
 * @property {number} [type]
 * @property {string} proTxHash
 * @property {string} service - Service string, ip and port
 * @property {string} [operatorPayoutAddress]
 * @property {string} inputsHash
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port
 * @property {number} [platformHTTPPort] Platform HTTP port
 * @property {string} [payloadSig]
 */

/**
 * @class ProUpServTxPayload
 * @property {number} version ProUpServTx version number. Currently set to 1.
 * @property {number} [type]
 * @property {string} proTXHash The hash of the initial ProRegTx
 * @property {string} service string - ip and port
 * @property {string} inputsHash Hash of all the outpoints of the transaction inputs
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port
 * @property {number} [platformHTTPPort] Platform HTTP port
 * @property {string} [scriptOperatorPayout] Payee script (p2pkh/p2sh)
 * @property {string} [payloadSig] BLSSig Signature of the hash of the ProUpServTx fields. Signed by the Operator.
 */
function ProUpServTxPayload(payloadJSON) {
  AbstractPayload.call(this);

  if (payloadJSON) {
    this.version = payloadJSON.version;

    if (this.version >= 2) {
      this.type = payloadJSON.type;
    }

    this.proTxHash = payloadJSON.proTxHash;
    this.service = payloadJSON.service;
    this.scriptOperatorPayout = Script.fromAddress(
      payloadJSON.operatorPayoutAddress
    ).toHex();
    this.inputsHash = payloadJSON.inputsHash;

    if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
      this.platformNodeID = payloadJSON.platformNodeID;
      this.platformP2PPort = payloadJSON.platformP2PPort;
      this.platformHTTPPort = payloadJSON.platformHTTPPort;
    }

    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
  }
}

ProUpServTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpServTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpServTxPayload();

  payload.version = payloadBufferReader.readUInt16LE();

  if (payload.version >= 2) {
    payload.type = payloadBufferReader.readUInt16LE();
  }

  payload.proTxHash = payloadBufferReader
    .read(HASH_SIZE)
    .reverse()
    .toString('hex');
  payload.service = ipUtils.bufferToIPAndPort(
    payloadBufferReader.read(ipUtils.IP_AND_PORT_SIZE)
  );
  // Note: can be 0 if not updated!
  var scriptOperatorPayoutSize = payloadBufferReader.readVarintNum();
  payload.scriptOperatorPayout = payloadBufferReader
    .read(scriptOperatorPayoutSize)
    .toString('hex');
  payload.inputsHash = payloadBufferReader
    .read(HASH_SIZE)
    .reverse()
    .toString('hex');

  if (payload.version >= 2 && payload.type === MASTERNODE_TYPE_HP) {
    payload.platformNodeID = payloadBufferReader.read(PLATFORM_NODE_ID_SIZE).reverse();
    payload.platformP2PPort = payloadBufferReader.readUInt16LE();
    payload.platformHTTPPort = payloadBufferReader.readUInt16LE();
  }

  payload.payloadSig = payloadBufferReader.read(BLSSIG_SIZE).toString('hex');

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
 * @param {ProUpServTxPayloadJSON} payloadJson
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromJSON = function fromJSON(payloadJson) {
  return new ProUpServTxPayload(payloadJson);
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
ProUpServTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );

  if (this.version >= 2) {
    Preconditions.checkArgument(
      isUnsignedInteger(this.type),
      'Expect type to be an unsigned integer'
    );
  }

  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'Expect proTXHash to be a hex string representing sha256 hash'
  );

  if (!ipUtils.isZeroAddress(this.service)) {
    Preconditions.checkArgument(
      ipUtils.isIPV4(this.service),
      'Expected service to be a string with ip address and port'
    );
  }

  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'Expect inputsHash to be a hex string representing sha256 hash'
  );

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    Preconditions.checkArgument(
      utils.isHexaString(this.platformNodeID),
      'Expect platformNodeID to be a hex string'
    );

    Preconditions.checkArgument(
      utils.isUnsignedInteger(this.platformP2PPort),
      'Expect platformP2PPort to be an integer'
    );

    Preconditions.checkArgument(
      utils.isUnsignedInteger(this.platformHTTPPort),
      'Expect platformHTTPPort to be an integer'
    );
  }

  if (this.scriptOperatorPayout) {
    var script = new Script(this.scriptOperatorPayout);
    Preconditions.checkArgument(
      script.isPublicKeyHashOut() || script.isScriptHashOut(),
      'Expected scriptOperatorPayout to be a p2pkh/p2sh'
    );
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgument(
      isHexString(this.payloadSig),
      'Expect payloadSig to be a hex string'
    );
    Preconditions.checkArgument(
      this.payloadSig.length * 2 !== BLSSIG_SIZE,
      "payloadSig size doesn't match BLS signature size"
    );
  }
  return true;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param [options.skipSignature]
 * @param [options.network] - network param for payout address serialization
 * @return {ProUpServTxPayloadJSON}
 */
ProUpServTxPayload.prototype.toJSON = function toJSON(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  var network = options && options.network;
  this.validate();
  /**
   * @type {ProUpServTxPayloadJSON}
   */
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    service: this.service,
    operatorPayoutAddress: new Script(this.scriptOperatorPayout)
      .toAddress(network)
      .toString(),
    inputsHash: this.inputsHash,
  };

  if (this.version >= 2) {
    payloadJSON.type = this.type;

    if (this.type === MASTERNODE_TYPE_HP) {
      payloadJSON.platformNodeID = this.platformNodeID;
      payloadJSON.platformP2PPort = this.platformP2PPort;
      payloadJSON.platformHTTPPort = this.platformHTTPPort;
    }
  }

  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature. Used for generating new signature
 * @return {Buffer}
 */
ProUpServTxPayload.prototype.toBuffer = function toBuffer(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);

  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);

  if (this.version >= 2) {
    payloadBufferWriter.writeUInt16LE(this.type);
  }

  payloadBufferWriter.write(Buffer.from(this.proTxHash, 'hex').reverse());

  payloadBufferWriter.write(ipUtils.ipAndPortToBuffer(this.service));

  var scriptOperatorPayout = Buffer.from(this.scriptOperatorPayout, 'hex');
  payloadBufferWriter.writeVarintNum(scriptOperatorPayout.length);
  payloadBufferWriter.write(scriptOperatorPayout);

  payloadBufferWriter.write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    payloadBufferWriter.write(Buffer.from(this.platformNodeID, 'hex').reverse())
      .writeUInt16LE(this.platformP2PPort)
      .writeUInt16LE(this.platformHTTPPort);
  }

  var payloadSignature;

  if (skipSignature) {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  } else {
    payloadSignature = Buffer.from(this.payloadSig, 'hex');
    payloadBufferWriter.write(payloadSignature);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.prototype.copy = function copy() {
  return ProUpServTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpServTxPayload;
