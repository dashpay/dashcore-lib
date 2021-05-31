/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var bufferUtil = require('../util/buffer');
var assert = require('assert');

/**
 *
 * @param obj
 * @returns {BufferWriter}
 * @constructor
 */
var BufferWriter = function BufferWriter(obj) {
  if (!(this instanceof BufferWriter)) return new BufferWriter(obj);
  if (obj) this.set(obj);
  else this.bufs = [];
};

/**
 * Set a list of buffers locally
 * @param {Buffer[]} obj.bufs - an array of buffer
 * @return {BufferWriter}
 */
BufferWriter.prototype.set = function (obj) {
  this.bufs = obj.bufs || this.bufs || [];
  return this;
};

/**
 * Returns a buffer which is the concatenation of all the buffers.
 * @return {Buffer}
 */
BufferWriter.prototype.toBuffer = function () {
  return this.concat();
};

/**
 * Returns a buffer which is the concatenation of all the buffers.
 * @return {Buffer}
 */
BufferWriter.prototype.concat = function () {
  return Buffer.concat(this.bufs);
};

/**
 * Append the buffer locally
 * @param {Buffer} buf
 * @return {BufferWriter}
 */
BufferWriter.prototype.write = function (buf) {
  assert(bufferUtil.isBuffer(buf));
  this.bufs.push(buf);
  return this;
};

/**
 * Reverse the buffer passed as argument and writes it locally
 * @param {Buffer} buf
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeReverse = function (buf) {
  assert(bufferUtil.isBuffer(buf));
  this.bufs.push(bufferUtil.reverse(buf));
  return this;
};

/**
 * Write a UInt8 to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt8 = function (n) {
  var buf = Buffer.alloc(1);
  buf.writeUInt8(n, 0);
  this.write(buf);
  return this;
};

/**
 * Write a UInt16BE to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt16BE = function (n) {
  var buf = Buffer.alloc(2);
  buf.writeUInt16BE(n, 0);
  this.write(buf);
  return this;
};
/**
 * Write a UInt16LE to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt16LE = function (n) {
  var buf = Buffer.alloc(2);
  buf.writeUInt16LE(n, 0);
  this.write(buf);
  return this;
};

/**
 * Write a UInt32BE to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt32BE = function (n) {
  var buf = Buffer.alloc(4);
  buf.writeUInt32BE(n, 0);
  this.write(buf);
  return this;
};

/**
 * Write a Int32LE to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeInt32LE = function (n) {
  var buf = Buffer.alloc(4);
  buf.writeInt32LE(n, 0);
  this.write(buf);
  return this;
};

/**
 * Write a UInt32LE to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt32LE = function (n) {
  var buf = Buffer.alloc(4);
  buf.writeUInt32LE(n, 0);
  this.write(buf);
  return this;
};

/**
 * Write a UInt64BEBN to the local buffer array
 * @param {BN} bn
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt64BEBN = function (bn) {
  var buf = bn.toBuffer({ size: 8 });
  this.write(buf);
  return this;
};

/**
 * Write a UInt64LEBN to the local buffer array
 * @param {BN} bn
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeUInt64LEBN = function (bn) {
  var buf = bn.toBuffer({ size: 8 });
  this.writeReverse(buf);
  return this;
};

/**
 * Write a VarintNum to the local buffer array
 * @param {number} n
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeVarintNum = function (n) {
  var buf = BufferWriter.varintBufNum(n);
  this.write(buf);
  return this;
};

/**
 * Write a varIntBN to the local buffer array
 * @param {BN} bn
 * @return {BufferWriter}
 */
BufferWriter.prototype.writeVarintBN = function (bn) {
  var buf = BufferWriter.varintBufBN(bn);
  this.write(buf);
  return this;
};

/**
 * Return a varInt buffer based on input number
 * @param {number} n - a number
 * @return Buffer
 */
BufferWriter.varintBufNum = function (n) {
  var buf = undefined;
  if (n < 253) {
    buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
  } else if (n < 0x10000) {
    buf = Buffer.alloc(1 + 2);
    buf.writeUInt8(253, 0);
    buf.writeUInt16LE(n, 1);
  } else if (n < 0x100000000) {
    buf = Buffer.alloc(1 + 4);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(n, 1);
  } else {
    buf = Buffer.alloc(1 + 8);
    buf.writeUInt8(255, 0);
    buf.writeInt32LE(n & -1, 1);
    buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
  }
  return buf;
};
/**
 * Return a new buffer based on on BN argument
 * @param {BN} bn
 * @return Buffer
 */
BufferWriter.varintBufBN = function (bn) {
  var buf = undefined;
  var n = bn.toNumber();
  if (n < 253) {
    buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
  } else if (n < 0x10000) {
    buf = Buffer.alloc(1 + 2);
    buf.writeUInt8(253, 0);
    buf.writeUInt16LE(n, 1);
  } else if (n < 0x100000000) {
    buf = Buffer.alloc(1 + 4);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(n, 1);
  } else {
    var bw = new BufferWriter();
    bw.writeUInt8(255);
    bw.writeUInt64LEBN(bn);
    var buf = bw.concat();
  }
  return buf;
};

module.exports = BufferWriter;
