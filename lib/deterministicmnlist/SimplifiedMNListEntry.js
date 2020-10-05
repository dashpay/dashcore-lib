/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';
var _ = require('lodash');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var $ = require('../util/preconditions');
var Hash = require('../crypto/hash');
var constants = require('../constants');
var utils = require('../util/js');
var ipUtils = require('../util/ip');
var Address = require('../address');
var Networks = require('../networks');

var isSha256 = utils.isSha256HexString;
var isHexStringOfSize = utils.isHexStringOfSize;
var isHexString = utils.isHexaString;
var parseIp = ipUtils.bufferToIPAndPort;
var serializeIp = ipUtils.ipAndPortToBuffer;

var SHA256_HASH_SIZE = constants.SHA256_HASH_SIZE;
var PUBKEY_ID_SIZE = constants.PUBKEY_ID_SIZE;
var BLS_PUBLIC_KEY_SIZE = constants.BLS_PUBLIC_KEY_SIZE;

/**
 * @typedef {Object} SMLEntry
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 */

/**
 * @class SimplifiedMNListEntry
 * @param {string|Object|Buffer} arg - A Buffer, JSON string, or Object representing a SmlEntry
 * @param {string} [network]
 * @constructor
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 */
function SimplifiedMNListEntry(arg, network) {
  if (arg) {
    network = Networks.get(network);

    if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    } else if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListEntry.fromBuffer(arg, network);
    } else if (_.isObject(arg)) {
      return SimplifiedMNListEntry.fromObject(arg);
    } else if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    } else if (isHexString(arg)) {
      return SimplifiedMNListEntry.fromHexString(arg, network);
    } else {
      throw new TypeError('Unrecognized argument for SimplifiedMNListEntry');
    }
  }
}

/**
 * Parse buffer and returns SimplifiedMNListEntry
 * @param {Buffer} buffer
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromBuffer = function fromBuffer(buffer, network) {
  var bufferReader = new BufferReader(buffer);

  return SimplifiedMNListEntry.fromObject({
    proRegTxHash: bufferReader.read(SHA256_HASH_SIZE).reverse().toString('hex'),
    confirmedHash: bufferReader.read(SHA256_HASH_SIZE).reverse().toString('hex'),
    service: parseIp(bufferReader.read(ipUtils.IP_AND_PORT_SIZE)),
    pubKeyOperator: bufferReader.read(BLS_PUBLIC_KEY_SIZE).toString('hex'),
    votingAddress: Address.fromPublicKeyHash(bufferReader.read(PUBKEY_ID_SIZE), network).toString(),
    isValid: Boolean(bufferReader.readUInt8())
  });
};

/**
 * @param {string} string
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromHexString = function fromString(string, network) {
  return SimplifiedMNListEntry.fromBuffer(Buffer.from(string, 'hex'), network);
};

/**
 * Serialize SML entry to buffer
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.toBuffer = function toBuffer() {
  this.validate();
  var bufferWriter = new BufferWriter();

  bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.confirmedHash, 'hex').reverse());
  bufferWriter.write(serializeIp(this.service));
  bufferWriter.write(Buffer.from(this.pubKeyOperator, 'hex'));
  bufferWriter.write(Buffer.from(Address.fromString(this.votingAddress).hashBuffer, 'hex'));
  bufferWriter.writeUInt8(Number(this.isValid));

  return bufferWriter.toBuffer();
};

/**
 * Create SMLEntry from an object
 * @param {SMLEntry} obj
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromObject = function fromObject(obj) {
  var SMLEntry = new SimplifiedMNListEntry();
  SMLEntry.proRegTxHash = obj.proRegTxHash;
  SMLEntry.confirmedHash = obj.confirmedHash;
  SMLEntry.service = obj.service;
  SMLEntry.pubKeyOperator = obj.pubKeyOperator;
  SMLEntry.votingAddress = obj.votingAddress;
  SMLEntry.isValid = obj.isValid;

  SMLEntry.network = Address.fromString(obj.votingAddress).network;

  SMLEntry.validate();
  return SMLEntry;
};

SimplifiedMNListEntry.prototype.validate = function validate() {
  $.checkArgument(isSha256(this.proRegTxHash), 'Expected proRegTxHash to be a sha256 hex string');
  $.checkArgument(isSha256(this.confirmedHash), 'Expected confirmedHash to be a sha256 hex string');
  if (!ipUtils.isZeroAddress(this.service)) {
    $.checkArgument(ipUtils.isIPV4(this.service), 'Expected service to be a string with ip address and port');
  }
  $.checkArgument(isHexStringOfSize(this.pubKeyOperator, BLS_PUBLIC_KEY_SIZE * 2), 'Expected pubKeyOperator to be a pubkey id');
  $.checkArgument(Address.isValid(this.votingAddress), 'votingAddress is not valid');
  $.checkArgument(typeof this.isValid === 'boolean', 'Expected isValid to be a boolean');
};

SimplifiedMNListEntry.prototype.toObject = function toObject() {
  return {
    proRegTxHash: this.proRegTxHash,
    confirmedHash: this.confirmedHash,
    service: this.service,
    pubKeyOperator: this.pubKeyOperator,
    votingAddress: this.votingAddress,
    isValid: this.isValid
  };
};

/**
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.calculateHash = function calculateHash() {
  return Hash.sha256sha256(this.toBuffer());
};

/**
 * Gets the ip from the service property
 * @return {string}
 */
SimplifiedMNListEntry.prototype.getIp = function getIp() {
  return this.service.split(':')[0];
};

/**
 * Serialize confirmed hash with proRegTxHash for MN scores
 * and quorum member selection
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.confirmedHashWithProRegTxHash = function confirmedHashWithProRegTxHash() {
  var bufferWriter = new BufferWriter();
  bufferWriter.write(Buffer.from(this.confirmedHash, 'hex'));
  bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex'));
  return Hash.sha256(bufferWriter.toBuffer().reverse()).reverse();
};

/**
 * Creates a copy of SimplifiedMNListEntry
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.prototype.copy = function copy() {
  return SimplifiedMNListEntry.fromBuffer(this.toBuffer(), this.network);
};

module.exports = SimplifiedMNListEntry;
