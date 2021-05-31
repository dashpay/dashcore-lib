/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var BloomFilter = require('bloom-filter');
var BufferReader = require('./encoding/bufferreader');
var BufferWriter = require('./encoding/bufferwriter');

/**
 * @memberOf BloomFilter
 * A constructor for Bloom Filters
 * @see https://github.com/bitpay/bloom-filter
 * @param {Buffer} payload
 * @return Filter
 */
BloomFilter.fromBuffer = function fromBuffer(payload) {
  var obj = {};
  var parser = new BufferReader(payload);
  var length = parser.readVarintNum();
  obj.vData = [];
  for (var i = 0; i < length; i++) {
    obj.vData.push(parser.readUInt8());
  }
  obj.nHashFuncs = parser.readUInt32LE();
  obj.nTweak = parser.readUInt32LE();
  obj.nFlags = parser.readUInt8();
  return new BloomFilter(obj);
};

/**
 * Will return a buffer representation of the address
 *
 * @memberOf BloomFilter
 * @returns {Buffer}
 */
BloomFilter.prototype.toBuffer = function toBuffer() {
  var bw = new BufferWriter();
  bw.writeVarintNum(this.vData.length);
  for (var i = 0; i < this.vData.length; i++) {
    bw.writeUInt8(this.vData[i]);
  }
  bw.writeUInt32LE(this.nHashFuncs);
  bw.writeUInt32LE(this.nTweak);
  bw.writeUInt8(this.nFlags);
  return bw.concat();
};

module.exports = BloomFilter;
