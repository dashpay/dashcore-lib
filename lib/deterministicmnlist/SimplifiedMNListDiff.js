/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var BufferUtil = require('../util/buffer');
var _ = require('lodash');
var isHexString = require('../util/js').isHexa;

var SimplifiedMNListEntry = require('./SimplifiedMNListEntry');
var QuorumEntry = require('./QuorumEntry');
var PartialMerkleTree = require('../block/PartialMerkleTree');
var Transaction = require('../transaction');
var constants = require('../constants');
var Networks = require('../networks');

/**
 * @param {Buffer|Object|string} [arg] - A Buffer, JSON string, or Object representing a MnListDiff
 * @param {string} [network]
 * @class SimplifiedMNListDiff
 * @property {string} baseBlockHash - sha256
 * @property {string} blockHash - sha256
 * @property {PartialMerkleTree} cbTxMerkleTree
 * @property {Transaction} cbTx
 * @property {Array<string>} deletedMNs - sha256 hashes of deleted MNs
 * @property {Array<SimplifiedMNListEntry>} mnList
 * @property {Array<obj>} deletedQuorums - deleted quorum objects
 * @property {Array<QuorumEntry>} newQuorums
 * @property {string} merkleRootMNList - merkle root of the whole mn list
 * @property {string} merkleRootQuorums - merkle root of the quorum list
 */
function SimplifiedMNListDiff(arg, network) {
  if (arg) {
    network = Networks.get(network);

    if (arg instanceof SimplifiedMNListDiff) {
      return arg.copy();
    } else if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListDiff.fromBuffer(arg, network);
    } else if (_.isObject(arg)) {
      return SimplifiedMNListDiff.fromObject(arg, network);
    } else if (isHexString(arg)) {
      return SimplifiedMNListDiff.fromHexString(arg, network);
    } else {
      throw new TypeError('Unrecognized argument passed to SimplifiedMNListDiff constructor');
    }
  }
}

/**
 * Creates MnListDiff from a Buffer.
 * @param {Buffer} buffer
 * @param {string} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromBuffer = function fromBuffer(buffer, network) {
  var bufferReader = new BufferReader(Buffer.from(buffer));
  var data = {};

  data.baseBlockHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');
  data.blockHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');

  data.cbTxMerkleTree = PartialMerkleTree.fromBufferReader(bufferReader);
  data.cbTx = new Transaction().fromBufferReader(bufferReader);

  var deletedMNsCount = bufferReader.readVarintNum();
  data.deletedMNs = [];
  for (var i = 0; i < deletedMNsCount; i++) {
    data.deletedMNs.push(bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex'));
  }

  var mnListSize = bufferReader.readVarintNum();
  data.mnList = [];
  for (var i = 0; i < mnListSize; i++) {
    data.mnList.push(SimplifiedMNListEntry.fromBuffer(bufferReader.read(constants.SML_ENTRY_SIZE), network));
  }

  var deletedQuorumsCount = bufferReader.readVarintNum();
  data.deletedQuorums = [];
  for (var i = 0; i < deletedQuorumsCount; i++) {
    var deletedQuorum = {};
    deletedQuorum.llmqType = bufferReader.readUInt8();
    deletedQuorum.quorumHash = bufferReader.read(constants.SHA256_HASH_SIZE).reverse().toString('hex');
    data.deletedQuorums.push(deletedQuorum);
  }

  var newQuorumsSize = bufferReader.readVarintNum();
  data.newQuorums = [];
  for (var i = 0; i < newQuorumsSize; i++) {
    var quorumEntrySize = bufferReader.readVarintNum();
    var entry = bufferReader.read(quorumEntrySize);

    data.newQuorums.push(QuorumEntry.fromBuffer(entry));
  }

  data.merkleRootMNList = data.cbTx.extraPayload.merkleRootMNList;
  if (data.cbTx.extraPayload.version >= 2) {
    data.merkleRootQuorums = data.cbTx.extraPayload.merkleRootQuorums;
  }
  return this.fromObject(data, network);
};

/**
 * @param {string} hexString
 * @param {string} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromHexString = function fromHexString(hexString, network) {
  return SimplifiedMNListDiff.fromBuffer(Buffer.from(hexString, 'hex'), network);
};

/**
 * Serializes mnlist diff to a Buffer
 * @return {Buffer}
 */
SimplifiedMNListDiff.prototype.toBuffer = function toBuffer() {
  var bufferWriter = new BufferWriter();

  bufferWriter.write(Buffer.from(this.baseBlockHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.blockHash, 'hex').reverse());

  bufferWriter.write(this.cbTxMerkleTree.toBuffer());
  bufferWriter.write(this.cbTx.toBuffer());

  bufferWriter.writeVarintNum(this.deletedMNs.length);
  this.deletedMNs.forEach(function (deleteMNHash) {
    bufferWriter.write(Buffer.from(deleteMNHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.mnList.length);
  this.mnList.forEach(function (simplifiedMNListEntry) {
    bufferWriter.write(simplifiedMNListEntry.toBuffer());
  });

  bufferWriter.writeVarintNum(this.deletedQuorums.length);
  this.deletedQuorums.forEach(function (deletedQuorum) {
    bufferWriter.writeUInt8(deletedQuorum.llmqType);
    bufferWriter.write(Buffer.from(deletedQuorum.quorumHash, 'hex').reverse());
  });

  bufferWriter.writeVarintNum(this.newQuorums.length);
  this.newQuorums.forEach(function (quorumEntry) {
    bufferWriter.writeVarintNum(quorumEntry.toBuffer().length);
    bufferWriter.write(quorumEntry.toBuffer());
  });

  return bufferWriter.toBuffer();
};

/**
 * Creates MNListDiff from object
 * @param obj
 * @param {string|Network} [network]
 * @return {SimplifiedMNListDiff}
 */
SimplifiedMNListDiff.fromObject = function fromObject(obj, network) {
  var simplifiedMNListDiff = new SimplifiedMNListDiff();

  network = Networks.get(network);

  simplifiedMNListDiff.baseBlockHash = obj.baseBlockHash;
  simplifiedMNListDiff.blockHash = obj.blockHash;

  /* cbTxMerkleRoot start */
  simplifiedMNListDiff.cbTxMerkleTree = new PartialMerkleTree(obj.cbTxMerkleTree);
  /* cbTxMerkleRoot stop */

  simplifiedMNListDiff.cbTx = new Transaction(obj.cbTx);
  // Copy array of strings
  simplifiedMNListDiff.deletedMNs = obj.deletedMNs.slice();
  simplifiedMNListDiff.mnList = obj.mnList.map(function (SMLEntry) {
    return new SimplifiedMNListEntry(SMLEntry, network);
  });
  simplifiedMNListDiff.deletedQuorums = obj.deletedQuorums.slice();
  simplifiedMNListDiff.newQuorums = obj.newQuorums.map(function (quorumEntry) {
    return new QuorumEntry(quorumEntry);
  });
  simplifiedMNListDiff.merkleRootMNList = obj.merkleRootMNList;
  if (obj.merkleRootQuorums) {
    simplifiedMNListDiff.merkleRootQuorums = obj.merkleRootQuorums;
  }

  if (simplifiedMNListDiff.mnList.length > 0) {
    if (network && simplifiedMNListDiff.mnList[0].network.name !== network.name) {
      throw new Error('votingAddress network is not equal to ' + network.name);
    }

    simplifiedMNListDiff.network = simplifiedMNListDiff.mnList[0].network;
  } else {
    simplifiedMNListDiff.network = network;
  }

  return simplifiedMNListDiff;
};

SimplifiedMNListDiff.prototype.toObject = function toObject() {
  var obj = {};
  obj.baseBlockHash = this.baseBlockHash;
  obj.blockHash = this.blockHash;

  /* cbTxMerkleRoot start */
  obj.cbTxMerkleTree = this.cbTxMerkleTree.toString();
  /* cbTxMerkleRoot stop */

  obj.cbTx = this.cbTx.serialize(true);
  // Copy array of strings
  obj.deletedMNs = this.deletedMNs.slice();
  obj.mnList = this.mnList.map(function (SMLEntry) {
    return SMLEntry.toObject();
  });
  obj.deletedQuorums = this.deletedQuorums.slice();
  obj.newQuorums = this.newQuorums.map(function (SMLEntry) {
    return SMLEntry.toObject();
  });
  obj.merkleRootMNList = this.merkleRootMNList;
  if (this.merkleRootQuorums) {
    obj.merkleRootQuorums = this.merkleRootQuorums;
  }

  return obj;
};

SimplifiedMNListDiff.prototype.copy = function copy() {
  return SimplifiedMNListDiff.fromBuffer(this.toBuffer(), this.network);
};

module.exports = SimplifiedMNListDiff;
