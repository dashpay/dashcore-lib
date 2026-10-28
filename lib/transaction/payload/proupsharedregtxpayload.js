const constants = require('../../constants');
const Preconditions = require('../../util/preconditions');
const BufferWriter = require('../../encoding/bufferwriter');
const BufferReader = require('../../encoding/bufferreader');
const AbstractPayload = require('./abstractpayload');
const Signer = require('../../crypto/signer');
const utils = require('../../util/js');

const { isUnsignedInteger, isSha256HexString, isHexStringOfSize } = utils;

const CURRENT_PAYLOAD_VERSION = 1;
const HASH_SIZE = constants.SHA256_HASH_SIZE;
const CKEYID_SIZE = constants.PUBKEY_ID_SIZE;
const BLSPUBKEY_SIZE = constants.BLS_PUBLIC_KEY_SIZE;
const { COMPACT_SIGNATURE_SIZE } = constants;
const MAX_UINT16 = 0xffff;
// The signature count is serialized as a single byte
const MAX_SIG_COUNT = 0xff;

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
 * @property {string[]} payloadSigs uint_8 + 65 * n	Compact ECDSA signatures of the payload hash,
 * one per share in share order
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
ProUpSharedRegTxPayload.fromBuffer = function fromBuffer(rawPayload) {
  const payloadBufferReader = new BufferReader(rawPayload);
  const payload = new ProUpSharedRegTxPayload();
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

  const sigCount = payloadBufferReader.readUInt8();
  for (let i = 0; i < sigCount; i++) {
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
ProUpSharedRegTxPayload.prototype.validate = function validate() {
  Preconditions.checkArgument(
    isUnsignedInteger(this.version) && this.version <= MAX_UINT16,
    'Expected version to be an unsigned 16-bit integer'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isHexStringOfSize(this.pubKeyOperator, BLSPUBKEY_SIZE * 2),
    `Expected pubKeyOperator to be a ${BLSPUBKEY_SIZE}-byte hex string`
  );
  Preconditions.checkArgument(
    isHexStringOfSize(this.keyIDVoting, CKEYID_SIZE * 2),
    `Expected keyIDVoting to be a ${CKEYID_SIZE}-byte hex string`
  );
  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'expected inputsHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    Array.isArray(this.payloadSigs) && this.payloadSigs.length <= MAX_SIG_COUNT,
    `Expected payloadSigs to be an array of at most ${MAX_SIG_COUNT} signatures`
  );
  this.payloadSigs.forEach((payloadSig) => {
    Preconditions.checkArgument(
      isHexStringOfSize(payloadSig, COMPACT_SIGNATURE_SIZE * 2),
      `Expected each payloadSig to be a ${COMPACT_SIGNATURE_SIZE}-byte hex string`
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
  const skipSignature = Boolean(options && options.skipSignature);
  const payloadJSON = {
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
  const payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .write(Buffer.from(this.pubKeyOperator, 'hex'))
    .write(Buffer.from(this.keyIDVoting, 'hex').reverse())
    .write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (!(options && options.skipSignature)) {
    payloadBufferWriter.writeUInt8(this.payloadSigs.length);
    this.payloadSigs.forEach((payloadSig) => {
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
  const payloadHash = this.getHash({ skipSignature: true });
  this.payloadSigs.push(
    Signer.signHash(payloadHash, privateKey).toString('hex')
  );
  return this;
};

/**
 * Verifies one of the payload signatures against a share owner key id.
 * Like Core, only canonical signatures (recovery header 27..34, low S) verify.
 * @param {string|Buffer} publicKeyId - share owner key id
 * @param {number} [sigIndex=0] - index of the signature in payloadSigs
 * @return {boolean}
 */
ProUpSharedRegTxPayload.prototype.verifySignature = function verifySignature(
  publicKeyId,
  sigIndex
) {
  const payloadSig = this.payloadSigs[sigIndex || 0];
  Preconditions.checkArgument(payloadSig, 'Missing payloadSig to verify');
  return Signer.verifyHashSignatureCanonical(
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
