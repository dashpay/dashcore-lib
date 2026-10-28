/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var Signer = require('../../crypto/signer');
var utils = require('../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isSha256HexString = utils.isSha256HexString;
var isHexStringOfSize = utils.isHexStringOfSize;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var CKEYID_SIZE = constants.PUBKEY_ID_SIZE;
var BLSPUBKEY_SIZE = constants.BLS_PUBLIC_KEY_SIZE;
var COMPACT_SIGNATURE_SIZE = constants.COMPACT_SIGNATURE_SIZE;
// The signature count is serialized as a single byte
var MAX_SIG_COUNT = 255;

/**
 * @typedef {Object} ProUpSharedRegTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {string} pubKeyOperator
 * @property {string} keyIDVoting
 * @property {string} inputsHash
 * @property {string[]} [payloadSigs]
 */

/**
 * @class ProUpSharedRegTxPayload
 * @property {number} version uint_16	2	ProUpSharedRegTx version number. Currently set to 1.
 * @property {string} proTxHash uint256	32	The hash of the shared masternode's provider transaction
 * @property {string} pubKeyOperator BLSPubKey	48	The new operator public key (basic BLS scheme)
 * @property {string} keyIDVoting CKeyID	20	The new public key hash used for voting
 * @property {string} inputsHash uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string[]} payloadSigs uint_8 + 65 * n	Compact ECDSA signatures of the payload hash, one per share in share order
 *
 * @param {ProUpSharedRegTransactionPayloadJSON} [payloadJSON]
 * @constructor
 */
function ProUpSharedRegTxPayload(payloadJSON) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
  this.payloadSigs = [];

  if (payloadJSON) {
    if (payloadJSON.version !== undefined) {
      this.version = payloadJSON.version;
    }
    this.proTxHash = payloadJSON.proTxHash;
    this.pubKeyOperator = payloadJSON.pubKeyOperator;
    this.keyIDVoting = payloadJSON.keyIDVoting;
    this.inputsHash = payloadJSON.inputsHash;
    if (payloadJSON.payloadSigs) {
      this.payloadSigs = payloadJSON.payloadSigs.slice();
    }
    this.validate();
  }
}

ProUpSharedRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpSharedRegTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parses raw ProUpSharedRegTxPayload payload
 * @param {Buffer} rawPayload
 * @return {ProUpSharedRegTxPayload}
 */
ProUpSharedRegTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpSharedRegTxPayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.proTxHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');
  payload.pubKeyOperator = payloadBufferReader
    .read(BLSPUBKEY_SIZE)
    .toString('hex');
  payload.keyIDVoting = payloadBufferReader
    .readReverse(CKEYID_SIZE)
    .toString('hex');
  payload.inputsHash = payloadBufferReader
    .readReverse(HASH_SIZE)
    .toString('hex');

  var sigCount = payloadBufferReader.readUInt8();
  for (var i = 0; i < sigCount; i++) {
    payload.payloadSigs.push(
      payloadBufferReader.read(COMPACT_SIGNATURE_SIZE).toString('hex')
    );
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
 * Creates new instance of ProUpSharedRegTxPayload payload from JSON
 * @param {string|ProUpSharedRegTransactionPayloadJSON} payloadJSON
 * @return {ProUpSharedRegTxPayload}
 */
ProUpSharedRegTxPayload.fromJSON = function fromJSON(payloadJSON) {
  return new ProUpSharedRegTxPayload(payloadJSON);
};

/* Instance methods */

/**
 * Validates ProUpSharedRegTxPayload payload data
 * @return {boolean}
 */
ProUpSharedRegTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version),
    'Expected version to be an unsigned integer'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isHexStringOfSize(this.pubKeyOperator, BLSPUBKEY_SIZE * 2),
    'Expected pubKeyOperator to be a ' + BLSPUBKEY_SIZE + '-byte hex string'
  );
  Preconditions.checkArgument(
    isHexStringOfSize(this.keyIDVoting, CKEYID_SIZE * 2),
    'Expected keyIDVoting to be a ' + CKEYID_SIZE + '-byte hex string'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'expected inputsHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    Array.isArray(this.payloadSigs) &&
      this.payloadSigs.length <= MAX_SIG_COUNT,
    'Expected payloadSigs to be an array of at most ' +
      MAX_SIG_COUNT +
      ' signatures'
  );
  this.payloadSigs.forEach(function (payloadSig) {
    Preconditions.checkArgument(
      isHexStringOfSize(payloadSig, COMPACT_SIGNATURE_SIZE * 2),
      'Expected each payloadSig to be a ' +
        COMPACT_SIGNATURE_SIZE +
        '-byte hex string'
    );
  });

  return true;
};

/**
 * Serializes ProUpSharedRegTxPayload payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signatures. Needed for creating new signatures
 * @return {ProUpSharedRegTransactionPayloadJSON}
 */
ProUpSharedRegTxPayload.prototype.toJSON = function toJSON(options) {
  var skipSignature = Boolean(options && options.skipSignature);
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    pubKeyOperator: this.pubKeyOperator,
    keyIDVoting: this.keyIDVoting,
    inputsHash: this.inputsHash,
  };
  if (!skipSignature) {
    payloadJSON.payloadSigs = this.payloadSigs.slice();
  }
  return payloadJSON;
};

/**
 * Serializes ProUpSharedRegTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - omit the signatures, as Core does when
 * hashing the payload for signing
 * @return {Buffer}
 */
ProUpSharedRegTxPayload.prototype.toBuffer = function toBuffer(options) {
  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .write(Buffer.from(this.pubKeyOperator, 'hex'))
    .write(Buffer.from(this.keyIDVoting, 'hex').reverse())
    .write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (!(options && options.skipSignature)) {
    payloadBufferWriter.writeUInt8(this.payloadSigs.length);
    this.payloadSigs.forEach(function (payloadSig) {
      payloadBufferWriter.write(Buffer.from(payloadSig, 'hex'));
    });
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Signs the payload hash and appends the signature to payloadSigs.
 * Every share owner signs, in share order.
 * @param {string|PrivateKey} privateKey - share owner key
 * @return {ProUpSharedRegTxPayload}
 */
ProUpSharedRegTxPayload.prototype.sign = function sign(privateKey) {
  var payloadHash = this.getHash({ skipSignature: true });
  this.payloadSigs.push(
    Signer.signHash(payloadHash, privateKey).toString('hex')
  );
  return this;
};

/**
 * Verifies one of the payload signatures against a share owner key id
 * @param {string|Buffer} publicKeyId - share owner key id
 * @param {number} [sigIndex=0] - index of the signature in payloadSigs
 * @return {boolean}
 */
ProUpSharedRegTxPayload.prototype.verifySignature = function verifySignature(
  publicKeyId,
  sigIndex
) {
  var payloadSig = this.payloadSigs[sigIndex || 0];
  Preconditions.checkArgument(payloadSig, 'Missing payloadSig to verify');
  return Signer.verifyHashSignature(
    this.getHash({ skipSignature: true }),
    Buffer.from(payloadSig, 'hex'),
    publicKeyId
  );
};

/**
 * Copy payload instance
 * @return {ProUpSharedRegTxPayload}
 */
ProUpSharedRegTxPayload.prototype.copy = function copy() {
  return ProUpSharedRegTxPayload.fromJSON(this.toJSON());
};

module.exports = ProUpSharedRegTxPayload;
