/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var utils = require('../../util/js');
var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var QuorumEntry = require('../../deterministicmnlist/QuorumEntry');

var CURRENT_PAYLOAD_VERSION = 1;

/**
* @typedef {Object} CommitmentTxPayloadJSON
* @property {number} version	uint16_t	2	Commitment special transaction version number. Currently set to 1. Please note that this is not the same as the version field of qfcommit
* @property {number} height	uint16_t	2	The height of the block in which this commitment is included
* @property {number} qfcVersion	uint16_t	2	Version of the final commitment message
* @property {number} llmqtype	uint8_t	1	type of the long living masternode quorum
* @property {string} quorumHash	uint256	32	The quorum identifier
* @property {number} signersSize	compactSize uint	1-9	Bit size of the signers bitvector
* @property {string} signers	byte[]	(bitSize + 7) / 8	Bitset representing the aggregated signers of this final commitment
* @property {number} validMembersSize	compactSize uint	1-9	Bit size of the validMembers bitvector
* @property {string} validMembers	byte[]	(bitSize + 7) / 8	Bitset of valid members in this commitment
* @property {string} quorumPublicKey	BLSPubKey	48	The quorum public key
* @property {string} quorumVvecHash	uint256	32	The hash of the quorum verification vector
* @property {string} quorumSig	BLSSig	96	Recovered threshold signature
* @property {string} sig	BLSSig	96	Aggregated BLS signatures from all included commitments
*/

/**
* @class CommitmentTxPayload
* @property {number} version
* @property {number} height
* @property {number} qfcVersion
* @property {number} llmqtype
* @property {string} quorumHash
* @property {number} signersSize
* @property {string} signers
* @property {number} validMembersSize
* @property {string} validMembers
* @property {string} quorumPublicKey
* @property {string} quorumVvecHash
* @property {string} quorumSig
* @property {string} sig
*/

function CommitmentTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (options) {
    this.height = options.height;
    this.qfcVersion = options.qfcVersion;
    this.llmqtype = options.llmqtype;
    this.quorumHash = options.quorumHash;
    this.signers = options.signers;
    this.validMembers = options.validMembers;
    this.quorumPublicKey = options.quorumPublicKey;
    this.quorumVvecHash = options.quorumVvecHash;
    this.quorumSig = options.quorumSig;
    this.sig = options.sig;
  }
}

CommitmentTxPayload.prototype = Object.create(AbstractPayload.prototype);
CommitmentTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw payload
 * @param {Buffer} rawPayload
 * @return {CommitmentTxPayload}
 */
CommitmentTxPayload.fromBuffer = function fromBuffer(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new CommitmentTxPayload();
  payload.version = payloadBufferReader.readUInt16LE();
  payload.height = payloadBufferReader.readInt32LE();
  payload.qfcVersion = payloadBufferReader.readUInt16LE();
  payload.llmqtype = payloadBufferReader.readUInt8();
  payload.quorumHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).toString('hex');

  payload.signersSize = payloadBufferReader.readVarintNum();
  var signersBytesToRead = Math.floor((payload.signersSize + 7) / 8) || 1;
  payload.signers = payloadBufferReader.read(signersBytesToRead).toString('hex');

  payload.validMembersSize = payloadBufferReader.readVarintNum();
  var validMembersBytesToRead = Math.floor((payload.validMembersSize + 7) / 8) || 1;
  payload.validMembers = payloadBufferReader.read(validMembersBytesToRead).toString('hex');

  payload.quorumPublicKey = payloadBufferReader.read(constants.BLS_PUBLIC_KEY_SIZE).toString('hex');
  payload.quorumVvecHash = payloadBufferReader.read(constants.SHA256_HASH_SIZE).toString('hex');
  payload.quorumSig = payloadBufferReader.read(constants.BLS_SIGNATURE_SIZE).toString('hex');
  payload.sig = payloadBufferReader.read(constants.BLS_SIGNATURE_SIZE).toString('hex');

  if (!payloadBufferReader.finished()) {
    throw new Error('Failed to parse payload: raw payload is bigger than expected.');
  }

  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|CommitmentTxPayloadJSON} payloadJson
 * @return {CommitmentTxPayload}
 */
CommitmentTxPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new CommitmentTxPayload(payloadJson);
  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validate payload
 * @return {boolean}
 */
CommitmentTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(utils.isUnsignedInteger(this.version), 'Expect version to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.height), 'Expect height to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.qfcVersion), 'Expect qfcVersion to be an unsigned integer');
  Preconditions.checkArgument(utils.isUnsignedInteger(this.llmqtype), 'Expect llmqtype to be an unsigned integer');
  Preconditions.checkArgument(utils.isHexaString(this.quorumHash), 'Expect quorumHash to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.signers), 'Expect signers to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.validMembers), 'Expect validMembers to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.quorumPublicKey), 'Expect quorumPublicKey to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.quorumVvecHash), 'Expect quorumVvecHash to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.quorumSig), 'Expect quorumSig to be a hex string');
  Preconditions.checkArgument(utils.isHexaString(this.sig), 'Expect sig to be a hex string');
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @return {CommitmentTxPayload}
 */
CommitmentTxPayload.prototype.toJSON = function toJSON(options) {
  this.validate();
  var payloadJSON = {
    version: this.version,
    height: this.height,
    qfcVersion: this.qfcVersion,
    llmqtype: this.llmqtype,
    quorumHash: this.quorumHash,
    signersSize: this.signersSize,
    signers: this.signers,
    validMembersSize: this.validMembersSize,
    validMembers: this.validMembers,
    quorumPublicKey: this.quorumPublicKey,
    quorumVvecHash: this.quorumVvecHash,
    quorumSig: this.quorumSig,
    sig: this.sig,
  };

  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @return {Buffer}
 */
CommitmentTxPayload.prototype.toBuffer = function toBuffer(options) {
  this.validate();

  // This will validate quorum type
  QuorumEntry.getParams(this.llmqtype);

  var payloadBufferWriter = new BufferWriter();
  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt32LE(this.height)
    .writeUInt16LE(this.qfcVersion)
    .writeUInt8(this.llmqtype)
    .write(Buffer.from(this.quorumHash, 'hex'))
    .writeVarintNum(this.signersSize)
    .write(Buffer.from(this.signers, 'hex'))
    .writeVarintNum(this.validMembersSize)
    .write(Buffer.from(this.validMembers, 'hex'))
    .write(Buffer.from(this.quorumPublicKey, 'hex'))
    .write(Buffer.from(this.quorumVvecHash, 'hex'))
    .write(Buffer.from(this.quorumSig, 'hex'))
    .write(Buffer.from(this.sig, 'hex'));

  return payloadBufferWriter.toBuffer();
};

CommitmentTxPayload.prototype.copy = function copy() {
  return CommitmentTxPayload.fromBuffer(this.toBuffer());
};

module.exports = CommitmentTxPayload;
