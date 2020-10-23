const _ = require('lodash');
const BN = require('../crypto/bn');
const { isBuffer, reverse: reverseBuffer } = require('../util/buffer');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const Hash = require('../crypto/hash');
const $ = require('../util/preconditions');

const GENESIS_BITS = 0x1d00ffff;

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {BlockHeader.fromObjectParams|Buffer} arg - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
const BlockHeader = function BlockHeader(arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg);
  }
  const info = BlockHeader._from(arg);
  this.version = info.version;
  this.prevHash = info.prevHash;
  this.merkleRoot = info.merkleRoot;
  this.time = info.time;
  this.timestamp = info.time;
  this.bits = info.bits;
  this.nonce = info.nonce;

  if (info.hash) {
    $.checkState(
      this.hash === info.hash,
      'Argument object hash property does not match block hash.',
    );
  }

  return this;
};

/**
 * @param {BlockHeader.fromObjectParams|Buffer} arg - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block header data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
BlockHeader._from = function _from(arg) {
  let info = {};
  if (isBuffer(arg)) {
    info = BlockHeader._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = BlockHeader._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for BlockHeader');
  }
  return info;
};

/**
 * @param {BlockHeader.fromObjectParams} data - A plain JavaScript object
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  let { prevHash, merkleRoot } = data;
  if (_.isString(data.prevHash)) {
    prevHash = reverseBuffer(Buffer.from(data.prevHash, 'hex'));
  }
  if (_.isString(data.merkleRoot)) {
    merkleRoot = reverseBuffer(Buffer.from(data.merkleRoot, 'hex'));
  }
  const info = {
    hash: data.hash,
    version: data.version,
    prevHash,
    merkleRoot,
    time: data.time,
    timestamp: data.time,
    bits: data.bits,
    nonce: data.nonce,
  };
  return info;
};

/**
 * @param {BlockHeader.fromObjectParams} obj - A plain JavaScript object
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromObject = function fromObject(obj) {
  const info = BlockHeader._fromObject(obj);
  return new BlockHeader(info);
};

/**
 * @param {Buffer|string} rawData - Raw block binary data or buffer
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromRawBlock = function fromRawBlock(rawData) {
  let data = rawData;
  if (!isBuffer(data)) {
    data = Buffer.from(data, 'binary');
  }
  const br = BufferReader(data);
  br.pos = BlockHeader.Constants.START_OF_HEADER;
  const info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @param {Buffer} buf - A buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBuffer = function fromBuffer(buf) {
  const info = BlockHeader._fromBufferReader(BufferReader(buf));
  return new BlockHeader(info);
};

/**
 * @param {string} str - A hex encoded buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromString = function fromString(str) {
  const buf = Buffer.from(str, 'hex');
  return BlockHeader.fromBuffer(buf);
};

/**
 * @param {BufferReader} br - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader(br) {
  const info = {};
  info.version = br.readInt32LE();
  info.prevHash = br.read(32);
  info.merkleRoot = br.read(32);
  info.time = br.readUInt32LE();
  info.bits = br.readUInt32LE();
  info.nonce = br.readUInt32LE();
  return info;
};

/**
 * @param {BufferReader} br - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBufferReader = function fromBufferReader(br) {
  const info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @function
 * @returns {Object} - A plain object of the BlockHeader
 */
BlockHeader.prototype.toJSON = function toObject() {
  return {
    hash: this.hash,
    version: this.version,
    prevHash: reverseBuffer(this.prevHash).toString('hex'),
    merkleRoot: reverseBuffer(this.merkleRoot).toString('hex'),
    time: this.time,
    bits: this.bits,
    nonce: this.nonce,
  };
};

BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON;

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().toBuffer();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} bw - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.toBufferWriter = function toBufferWriter(bw) {
  const bufferWriter = bw || new BufferWriter();
  bufferWriter.writeInt32LE(this.version);
  bufferWriter.write(this.prevHash);
  bufferWriter.write(this.merkleRoot);
  bufferWriter.writeUInt32LE(this.time);
  bufferWriter.writeUInt32LE(this.bits);
  bufferWriter.writeUInt32LE(this.nonce);
  return bufferWriter;
};

/**
 * Returns the target difficulty for this block
 * @param {Number} [targetBits]
 * @returns {BN} An instance of BN with the decoded difficulty bits
 */
BlockHeader.prototype.getTargetDifficulty = function getTargetDifficulty(targetBits) {
  const bits = targetBits || this.bits;

  // eslint-disable-next-line no-bitwise
  let target = new BN(bits & 0xffffff);
  // eslint-disable-next-line no-bitwise
  let mov = 8 * ((bits >>> 24) - 3);
  // eslint-disable-next-line no-plusplus
  while (mov-- > 0) {
    target = target.mul(new BN(2));
  }
  return target;
};

/**
 * @link https://en.bitcoin.it/wiki/Difficulty
 * @return {Number}
 */
BlockHeader.prototype.getDifficulty = function getDifficulty() {
  const difficulty1TargetBN = this.getTargetDifficulty(GENESIS_BITS).mul(new BN(10 ** 8));
  const currentTargetBN = this.getTargetDifficulty();

  let difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10);
  const decimalPos = difficultyString.length - 8;
  difficultyString = `${difficultyString.slice(0, decimalPos)}.${difficultyString.slice(decimalPos)}`;

  return parseFloat(difficultyString);
};

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
BlockHeader.prototype._getHash = function hash() {
  const buf = this.toBuffer();
  // return Hash.sha256sha256(buf);
  return Hash.x11(buf);
};

const idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get() {
    if (!this._id) {
      this._id = BufferReader(this._getHash()).readReverse().toString('hex');
    }
    return this._id;
  },
  set: _.noop,
};
Object.defineProperty(BlockHeader.prototype, 'id', idProperty);
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty);

/**
 * @returns {Boolean} - If timestamp is not too far in the future
 */
BlockHeader.prototype.validTimestamp = function validTimestamp() {
  const currentTime = Math.round(new Date().getTime() / 1000);
  if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
    return false;
  }
  return true;
};

/**
 * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
 */
BlockHeader.prototype.validProofOfWork = function validProofOfWork() {
  const pow = new BN(this.id, 'hex');
  const target = this.getTargetDifficulty();

  if (pow.cmp(target) > 0) {
    return false;
  }
  return true;
};

/**
 * @returns {string} - A string formatted for the console
 */
BlockHeader.prototype.inspect = function inspect() {
  return `<BlockHeader ${this.id}>`;
};

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex'),
};

module.exports = BlockHeader;
