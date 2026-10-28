/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var Script = require('../../script');
var utils = require('../../util/js');
var protxUtils = require('./protxutils');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var CKEYID_SIZE = constants.PUBKEY_ID_SIZE;
var BLSPUBKEY_SIZE = constants.BLS_PUBLIC_KEY_SIZE;
var COMPACT_SIGNATURE_SIZE = constants.COMPACT_SIGNATURE_SIZE;
var PROTX_EXT_ADDR_VERSION = constants.PROTX_EXT_ADDR_VERSION;

/**
 * @typedef {Object} ProUpRegTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {string} pubKeyOperator
 * @property {string} keyIDVoting
 * @property {string} [payoutAddress] Before version 3
 * @property {MasternodePayoutJSON[]} [payouts] Owner payees with their reward shares. From version 3
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 */

/**
 * @class ProUpRegTxPayload
 * @property {number} version uint_16	2	Upgrade Provider Transaction version number. Currently set to 1.
 * @property {string} proTxHash uint256	32	The hash of the provider transaction
 * @property {number} mode uint_16	2	Masternode mode
 * @property {string} pubKeyOperator BLSPubKey	48	The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting CKeyID	20	The public key hash used for voting.
 * @property {number} scriptPayoutSize compactSize uint	1-9	Size of the Payee Script.
 * @property {string} [scriptPayout] Script	Variable	Payee script (p2pkh/p2sh). Before version 3
 * @property {MasternodePayout[]} [payouts] Owner payees with their reward shares. From version 3
 * @property {string} inputsHash uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {number} payloadSigSize compactSize uint	1-9	Size of the Signature
 * @property {string} payloadSig vector	Variable	Signature of the hash of the ProTx fields. Signed by the Owner.
 *
 * @param {ProUpRegTransactionPayloadJSON} [payloadJSON]
 * @constructor
 */
function ProUpRegTxPayload(payloadJSON) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (payloadJSON) {
    if (payloadJSON.version !== undefined) {
      this.version = payloadJSON.version;
    }
    this.proTxHash = payloadJSON.proTxHash;
    this.mode = payloadJSON.mode !== undefined ? payloadJSON.mode : 0;
    this.pubKeyOperator = payloadJSON.pubKeyOperator;
    this.keyIDVoting = payloadJSON.keyIDVoting;
    if (this.version >= PROTX_EXT_ADDR_VERSION) {
      protxUtils.checkNoFields(
        payloadJSON,
        ['payoutAddress', 'scriptPayout'],
        this.version
      );
      this.payouts = protxUtils.payoutsFromJSON(payloadJSON.payouts || []);
    } else {
      protxUtils.checkNoFields(payloadJSON, ['payouts'], this.version);
      this.scriptPayout = Script.fromAddress(payloadJSON.payoutAddress).toHex();
    }
    this.inputsHash = payloadJSON.inputsHash;
    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }
    this.validate();
  }
}

ProUpRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpRegTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parses raw ProUpRegTxPayload payload
 * @param {Buffer} rawPayload
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpRegTxPayload();
  var signatureSize = 0;
  payload.version = payloadBufferReader.readUInt16LE();
  // readReverse copies: reversing a read() slice in place would modify rawPayload
  payload.proTxHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');
  payload.mode = payloadBufferReader.readUInt16LE();
  payload.pubKeyOperator = payloadBufferReader
    .read(BLSPUBKEY_SIZE)
    .toString('hex');
  payload.keyIDVoting = payloadBufferReader
    .readReverse(CKEYID_SIZE)
    .toString('hex');
  if (payload.version >= PROTX_EXT_ADDR_VERSION) {
    payload.payouts = protxUtils.readPayouts(payloadBufferReader);
  } else {
    var scriptPayoutSize = payloadBufferReader.readVarintNum();
    payload.scriptPayout = payloadBufferReader
      .read(scriptPayoutSize)
      .toString('hex');
  }
  payload.inputsHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');

  if (!payloadBufferReader.finished()) {
    signatureSize = payloadBufferReader.readVarintNum();
  }

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
 * Creates new instance of ProUpRegTxPayload payload from JSON
 * @param {string|ProUpRegTransactionPayloadJSON} payloadJSON
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.fromJSON = function fromJSON(payloadJSON) {
  return new ProUpRegTxPayload(payloadJSON);
};

/* Instance methods */

/**
 * Validates ProUpRegTxPayload payload data
 * @return {boolean}
 */
ProUpRegTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expected version to be an unsigned integer'
  );

  Preconditions.checkArgument(
    isHexString(this.pubKeyOperator),
    'Expect pubKeyOperator to be a hex string'
  );
  Preconditions.checkArgument(
    isHexString(this.keyIDVoting),
    'Expect keyIDVoting to be a hex string'
  );

  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'expected inputsHash to be a sha256 hex string'
  );

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    // Core passes no owner key for a ProUpRegTx (CProUpRegTx::IsTriviallyValid)
    protxUtils.validatePayouts(this.payouts, null, this.keyIDVoting);
  }

  if (this.scriptPayout) {
    var script = new Script(this.scriptPayout);
    Preconditions.checkArgument(
      script.isPublicKeyHashOut() || script.isScriptHashOut(),
      'Expected scriptPayout to be a p2pkh/p2sh'
    );
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgument(
      isHexString(this.payloadSig),
      'Expect payloadSig to be a hex string'
    );
    // signed by the owner key: a compact ECDSA signature, not a BLS one
    Preconditions.checkArgument(
      this.payloadSig.length === COMPACT_SIGNATURE_SIZE * 2,
      "payloadSig size doesn't match compact signature size"
    );
  }

  return true;
};

/**
 * Serializes ProUpRegTxPayload payload to JSON
 * @param [options]
 * @param [options.skipSignature] - skip signature part. Needed for creating new signature
 * @param [options.network]
 * @return {ProUpRegTransactionPayloadJSON}
 */
ProUpRegTxPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature =
    Boolean(options && options.skipSignature) || !Boolean(this.payloadSig);
  var network = options && options.network;
  /**
   * @type {ProUpRegTransactionPayloadJSON}
   */
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    pubKeyOperator: this.pubKeyOperator,
    keyIDVoting: this.keyIDVoting,
  };
  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payloadJSON.payouts = protxUtils.payoutsToJSON(this.payouts, network);
  } else {
    payloadJSON.payoutAddress = new Script(this.scriptPayout)
      .toAddress(network)
      .toString();
  }
  payloadJSON.inputsHash = this.inputsHash;
  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serializes ProUpRegTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
ProUpRegTxPayload.prototype.toBuffer = function toBuffer(options) {
  var skipSignature =
    !Boolean(this.payloadSig) || (options && options.skipSignature);
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .writeUInt16LE(this.mode)
    .write(Buffer.from(this.pubKeyOperator, 'hex'))
    .write(Buffer.from(this.keyIDVoting, 'hex').reverse());

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    protxUtils.writePayouts(payloadBufferWriter, this.payouts);
  } else if (this.scriptPayout) {
    var scriptPayoutBuf = Buffer.from(this.scriptPayout, 'hex');
    var scriptPayoutSize = scriptPayoutBuf.length;
    payloadBufferWriter.writeVarintNum(scriptPayoutSize);
    payloadBufferWriter.write(scriptPayoutBuf);
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  payloadBufferWriter.write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (!skipSignature) {
    var signatureBuf = Buffer.from(this.payloadSig, 'hex');
    payloadBufferWriter.writeVarintNum(signatureBuf.length);
    payloadBufferWriter.write(signatureBuf);
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpRegTxPayload}
 */
ProUpRegTxPayload.prototype.copy = function copy() {
  return ProUpRegTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpRegTxPayload;
