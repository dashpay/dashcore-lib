const constants = require('../../constants');
const Preconditions = require('../../util/preconditions');
const BufferWriter = require('../../encoding/bufferwriter');
const BufferReader = require('../../encoding/bufferreader');
const AbstractPayload = require('./abstractpayload');
const { readExact, readExactReverse } = require('./strictpayloadreader');
const Hash = require('../../crypto/hash');
const Signer = require('../../crypto/signer');
const utils = require('../../util/js');

const { isUnsignedInteger, isUInt16, isSha256HexString, isHexStringOfSize } =
  utils;

const CURRENT_PAYLOAD_VERSION = 1;
const HASH_SIZE = constants.SHA256_HASH_SIZE;
const { COMPACT_SIGNATURE_SIZE } = constants;
// The signature count is serialized as a single byte
const MAX_SIG_COUNT = 0xff;
// Domain separator of the dissolution sign hash (CProDisTx::MakeSignHash)
const SIGN_HASH_PREFIX = Buffer.from('DashSharedMNDissolve', 'utf8');
const MIN_SPECIAL_TRANSACTION_VERSION = 3;

/**
 * @typedef {Object} ProDisTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} actorIndex
 * @property {string[]} [payloadSigs]
 */

/**
 * @class ProDisTxPayload
 * @property {number} version uint_16	2	ProDisTx version number. Currently set to 1.
 * @property {string} proTxHash uint256	32	The hash of the shared masternode's provider transaction
 * @property {number} actorIndex uint_16	2	Index of the share that performs the dissolution
 * @property {string[]} payloadSigs uint_8 + 65 * n	Compact ECDSA signatures of the sign hash:
 * one by the actor's share owner (unilateral), or one per share in share order (unanimous)
 *
 * @param {ProDisTransactionPayloadJSON} [payloadJSON]
 * @constructor
 */
function ProDisTxPayload(payloadJSON) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;
  this.payloadSigs = [];

  if (payloadJSON) {
    if (payloadJSON.version !== undefined) {
      this.version = payloadJSON.version;
    }
    this.proTxHash = payloadJSON.proTxHash;
    this.actorIndex = payloadJSON.actorIndex;

    if (payloadJSON.payloadSigs) {
      this.payloadSigs = payloadJSON.payloadSigs.slice();
    }

    this.validate();
  }
}

ProDisTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProDisTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parses raw ProDisTxPayload payload
 * @param {Buffer} rawPayload
 * @return {ProDisTxPayload}
 */
ProDisTxPayload.fromBuffer = function fromBuffer(rawPayload) {
  const payloadBufferReader = new BufferReader(rawPayload);
  const payload = new ProDisTxPayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.proTxHash = readExactReverse(payloadBufferReader, HASH_SIZE).toString(
    'hex'
  );
  payload.actorIndex = payloadBufferReader.readUInt16LE();

  const sigCount = payloadBufferReader.readUInt8();
  for (let i = 0; i < sigCount; i++) {
    payload.payloadSigs.push(
      readExact(payloadBufferReader, COMPACT_SIGNATURE_SIZE).toString('hex')
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
 * Creates new instance of ProDisTxPayload payload from JSON
 * @param {string|ProDisTransactionPayloadJSON} payloadJSON
 * @return {ProDisTxPayload}
 */
ProDisTxPayload.fromJSON = function fromJSON(payloadJSON) {
  return new ProDisTxPayload(payloadJSON);
};

/* Instance methods */

/**
 * Validates ProDisTxPayload payload data
 * @return {boolean}
 */
ProDisTxPayload.prototype.validate = function validate() {
  Preconditions.checkArgument(
    isUInt16(this.version),
    'Expected version to be an unsigned 16-bit integer'
  );
  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'expected proTxHash to be a sha256 hex string'
  );
  Preconditions.checkArgument(
    isUInt16(this.actorIndex),
    'Expected actorIndex to be an unsigned 16-bit integer'
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
 * Serializes ProDisTxPayload payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signatures
 * @return {ProDisTransactionPayloadJSON}
 */
ProDisTxPayload.prototype.toJSON = function toJSON(options) {
  const skipSignature = Boolean(options && options.skipSignature);
  const payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
    actorIndex: this.actorIndex,
  };
  if (!skipSignature) {
    payloadJSON.payloadSigs = this.payloadSigs.slice();
  }
  return payloadJSON;
};

/**
 * Serializes ProDisTxPayload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - serialize with no signatures
 * @return {Buffer}
 */
ProDisTxPayload.prototype.toBuffer = function toBuffer(options) {
  this.validate();
  const payloadSigs = options && options.skipSignature ? [] : this.payloadSigs;
  const payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .write(Buffer.from(this.proTxHash, 'hex').reverse())
    .writeUInt16LE(this.actorIndex)
    .writeUInt8(payloadSigs.length);

  payloadSigs.forEach((payloadSig) => {
    payloadBufferWriter.write(Buffer.from(payloadSig, 'hex'));
  });

  return payloadBufferWriter.toBuffer();
};

/**
 * Hash that every dissolution signature commits to (CProDisTx::MakeSignHash).
 * It covers the transaction's inputs and outputs and the signature count,
 * which selects the mode: 1 = unilateral, the number of shares = unanimous.
 * @param {Transaction} transaction - the dissolution transaction
 * @param {number} sigCount - number of signatures the transaction will carry
 * @return {Buffer}
 */
ProDisTxPayload.prototype.getSignHash = function getSignHash(
  transaction,
  sigCount
) {
  Preconditions.checkArgument(
    transaction.type ===
      constants.registeredTransactionTypes.TRANSACTION_PROVIDER_DISSOLVE &&
      transaction.version >= MIN_SPECIAL_TRANSACTION_VERSION,
    'Expected a version 3+ provider dissolve (type 10) transaction'
  );
  Preconditions.checkArgument(
    isUnsignedInteger(sigCount) && sigCount <= MAX_SIG_COUNT,
    `Expected sigCount to be an unsigned integer of at most ${MAX_SIG_COUNT}`
  );
  this.validate();

  const writer = new BufferWriter();
  writer.writeVarintNum(SIGN_HASH_PREFIX.length);
  writer.write(SIGN_HASH_PREFIX);
  writer.writeUInt16LE(this.version);
  writer.writeUInt16LE(transaction.version);
  writer.writeUInt16LE(transaction.type);
  writer.writeUInt32LE(transaction.nLockTime);
  transaction.inputs.forEach((input) => {
    writer.writeReverse(input.prevTxId);
    writer.writeUInt32LE(input.outputIndex);
  });
  transaction.inputs.forEach((input) => {
    writer.writeUInt32LE(input.sequenceNumber);
  });
  transaction.outputs.forEach((output) => {
    output.toBufferWriter(writer);
  });
  writer.write(Buffer.from(this.proTxHash, 'hex').reverse());
  writer.writeUInt16LE(this.actorIndex);
  writer.writeUInt8(sigCount);

  return Hash.sha256sha256(writer.toBuffer());
};

/**
 * Signs the dissolution and appends the signature to payloadSigs.
 * For a unanimous dissolution every share owner signs, in share order,
 * with the same sigCount.
 * @param {string|PrivateKey} privateKey - share owner key
 * @param {Transaction} transaction - the dissolution transaction
 * @param {number} sigCount - number of signatures the transaction will carry
 * @return {ProDisTxPayload}
 */
ProDisTxPayload.prototype.sign = function sign(
  privateKey,
  transaction,
  sigCount
) {
  const signHash = this.getSignHash(transaction, sigCount);
  this.payloadSigs.push(Signer.signHash(signHash, privateKey).toString('hex'));
  return this;
};

/**
 * Verifies one of the dissolution signatures against a share owner key id.
 * Like Core, only canonical signatures (recovery header 27..34, low S) verify.
 * @param {string|Buffer} publicKeyId - share owner key id
 * @param {Transaction} transaction - the dissolution transaction
 * @param {number} [sigIndex=0] - index of the signature in payloadSigs
 * @return {boolean}
 */
ProDisTxPayload.prototype.verifySignature = function verifySignature(
  publicKeyId,
  transaction,
  sigIndex
) {
  const payloadSig = this.payloadSigs[sigIndex || 0];
  Preconditions.checkArgument(payloadSig, 'Missing payloadSig to verify');
  const signHash = this.getSignHash(transaction, this.payloadSigs.length);
  return Signer.verifyHashSignatureCanonical(
    signHash,
    Buffer.from(payloadSig, 'hex'),
    publicKeyId
  );
};

/**
 * Copy payload instance
 * @return {ProDisTxPayload}
 */
ProDisTxPayload.prototype.copy = function copy() {
  return ProDisTxPayload.fromJSON(this.toJSON());
};

module.exports = ProDisTxPayload;
