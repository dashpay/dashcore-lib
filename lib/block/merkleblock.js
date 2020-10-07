const _ = require('lodash');
const BlockHeader = require('./blockheader');
const BufferUtil = require('../util/buffer');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const Hash = require('../crypto/hash');
const Transaction = require('../transaction');
const PartialMerkleTree = require('./PartialMerkleTree');
const $ = require('../util/preconditions');

/**
 * Instantiate a MerkleBlock from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {Buffer|string|{
 *    header: BlockHeader|Object,
 *    numTransactions: number,
 *    hashes: string[],
 *    flags: number[]
 *  }} arg A Buffer, JSON string, or Object representing a MerkleBlock
 * @returns {MerkleBlock}
 * @constructor
 */
function MerkleBlock(arg) {
  /* jshint maxstatements: 18 */

  if (!(this instanceof MerkleBlock)) {
    return new MerkleBlock(arg);
  }

  let info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = MerkleBlock._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    let header;
    if (arg.header instanceof BlockHeader) {
      // eslint-disable-next-line prefer-destructuring
      header = arg.header;
    } else {
      header = BlockHeader.fromObject(arg.header);
    }
    info = {
      /**
       * @name MerkleBlock#header
       * @type {BlockHeader}
       */
      header,
      /**
       * @name MerkleBlock#numTransactions
       * @type {Number}
       */
      numTransactions: arg.numTransactions,
      /**
       * @name MerkleBlock#hashes
       * @type {String[]}
       */
      hashes: arg.hashes,
      /**
       * @name MerkleBlock#flags
       * @type {Number[]}
       */
      flags: arg.flags,
    };
  } else {
    throw new TypeError('Unrecognized argument for MerkleBlock');
  }
  _.extend(this, info);
  this._flagBitsUsed = 0;
  this._hashesUsed = 0;
  return this;
}

/**
 * Builds merkle block from block header, transaction hashes and filter matches
 * @param {BlockHeader|Object} header
 * @param {Buffer[]} transactionHashes
 * @param {boolean[]} filterMatches
 * @return {MerkleBlock}
 */
MerkleBlock.build = function build(header, transactionHashes, filterMatches) {
  const partialTree = new PartialMerkleTree({
    transactionHashes,
    filterMatches,
  });
  return new MerkleBlock({
    header,
    numTransactions: partialTree.totalTransactions,
    hashes: partialTree.merkleHashes,
    flags: partialTree.merkleFlags,
  });
};

/**
 * @param {Buffer} buf - MerkleBlock data in a Buffer object
 * @returns {MerkleBlock} - A MerkleBlock object
 */
MerkleBlock.fromBuffer = function fromBuffer(buf) {
  return MerkleBlock.fromBufferReader(BufferReader(buf));
};

/**
 * @param {BufferReader} br - MerkleBlock data in a BufferReader object
 * @returns {MerkleBlock} - A MerkleBlock object
 */
MerkleBlock.fromBufferReader = function fromBufferReader(br) {
  return new MerkleBlock(MerkleBlock._fromBufferReader(br));
};

/**
 * @returns {Buffer} - A buffer of the block
 */
MerkleBlock.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().toBuffer();
};

/**
 * @param {BufferWriter} bw - An existing instance of BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the MerkleBlock
 */
MerkleBlock.prototype.toBufferWriter = function toBufferWriter(bw) {
  const bufferWriter = bw || new BufferWriter();
  bufferWriter.write(this.header.toBuffer());
  bufferWriter.writeUInt32LE(this.numTransactions);
  bufferWriter.writeVarintNum(this.hashes.length);
  for (let i = 0; i < this.hashes.length; i += 1) {
    bufferWriter.write(Buffer.from(this.hashes[i], 'hex'));
  }
  bufferWriter.writeVarintNum(this.flags.length);
  for (let i = 0; i < this.flags.length; i += 1) {
    bufferWriter.writeUInt8(this.flags[i]);
  }
  return bufferWriter;
};

/**
 * @function
 * @returns {Object} - A plain object with the MerkleBlock properties
 */
MerkleBlock.prototype.toJSON = function toObject() {
  return {
    header: this.header.toObject(),
    numTransactions: this.numTransactions,
    hashes: this.hashes,
    flags: this.flags,
  };
};
/**
 * @function
 * @returns {Object} - A plain object with the MerkleBlock properties
 */
MerkleBlock.prototype.toObject = MerkleBlock.prototype.toJSON;

/**
 * Verify that the MerkleBlock is valid
 * @returns {Boolean} - True/False whether this MerkleBlock is Valid
 */
MerkleBlock.prototype.validMerkleTree = function validMerkleTree() {
  $.checkState(_.isArray(this.flags), 'MerkleBlock flags is not an array');
  $.checkState(_.isArray(this.hashes), 'MerkleBlock hashes is not an array');

  // Can't have more hashes than numTransactions
  if (this.hashes.length > this.numTransactions) {
    return false;
  }

  // Can't have more flag bits than num hashes
  if (this.flags.length * 8 < this.hashes.length) {
    return false;
  }

  const height = this._calcTreeHeight();
  const opts = { hashesUsed: 0, flagBitsUsed: 0 };
  const root = this._traverseMerkleTree(height, 0, opts);
  if (opts.hashesUsed !== this.hashes.length) {
    return false;
  }
  return BufferUtil.equals(root, this.header.merkleRoot);
};

/**
 * Traverse the tree in this MerkleBlock, validating it along the way
 * Modeled after Bitcoin Core merkleblock.cpp TraverseAndExtract()
 * @param {Number} depth - Current height
 * @param {Number} pos - Current position in the tree
 * @param {Object} [opts] - Object with values that need to be mutated throughout the traversal
 * @param {Number} [opts.flagBitsUsed] - Number of flag bits used, should start at 0
 * @param {Number} [opts.hashesUsed] - Number of hashes used, should start at 0
 * @param {Array} [opts.txs] - Will finish populated by transactions found during traversal
 * @returns {Buffer|null} - Buffer containing the Merkle Hash for that height
 * @private
 */
MerkleBlock.prototype._traverseMerkleTree = function traverseMerkleTree(depth, pos, opts) {
  /* jshint maxcomplexity:  12 */
  /* jshint maxstatements: 20 */
  const options = opts || {};
  options.txs = opts.txs || [];
  options.flagBitsUsed = opts.flagBitsUsed || 0;
  options.hashesUsed = opts.hashesUsed || 0;

  if (options.flagBitsUsed > this.flags.length * 8) {
    return null;
  }
  // eslint-disable-next-line no-bitwise,no-plusplus
  const isParentOfMatch = (this.flags[options.flagBitsUsed >> 3] >>> (options.flagBitsUsed++ & 7)) & 1;
  if (depth === 0 || !isParentOfMatch) {
    if (options.hashesUsed >= this.hashes.length) {
      return null;
    }
    // eslint-disable-next-line no-plusplus
    const hash = this.hashes[options.hashesUsed++];
    if (depth === 0 && isParentOfMatch) {
      options.txs.push(hash);
    }
    return Buffer.from(hash, 'hex');
  }
  const left = this._traverseMerkleTree(depth - 1, pos * 2, options);
  let right = left;
  if (pos * 2 + 1 < this._calcTreeWidth(depth - 1)) {
    right = this._traverseMerkleTree(depth - 1, pos * 2 + 1, options);
  }
  return Hash.sha256sha256(Buffer.concat([left, right]));
};

/** Calculates the width of a merkle tree at a given height.
 *  Modeled after Bitcoin Core merkleblock.h CalcTreeWidth()
 * @param {Number} height Height at which we want the tree width
 * @returns {Number} - Width of the tree at a given height
 * @private
 */
MerkleBlock.prototype._calcTreeWidth = function calcTreeWidth(height) {
  // eslint-disable-next-line no-bitwise
  return (this.numTransactions + (1 << height) - 1) >> height;
};

/** Calculates the height of the merkle tree in this MerkleBlock
 * @param {Number} - Height at which we want the tree width
 * @returns {Number} - Height of the merkle tree in this MerkleBlock
 * @private
 */
MerkleBlock.prototype._calcTreeHeight = function calcTreeHeight() {
  let height = 0;
  while (this._calcTreeWidth(height) > 1) {
    height += 1;
  }
  return height;
};

/**
 * @return {string[]}
 */
MerkleBlock.prototype.getMatchedTransactionHashes = function getMatchedTransactionHashes() {
  const txs = [];
  const height = this._calcTreeHeight();
  this._traverseMerkleTree(height, 0, { txs });
  return txs;
};

/**
 * @param {Transaction|String} tx Transaction or Transaction ID Hash
 * @returns {Boolean} - return true/false if this MerkleBlock has the TX or not
 * @private
 */
MerkleBlock.prototype.hasTransaction = function hasTransaction(tx) {
  $.checkArgument(!_.isUndefined(tx), 'tx cannot be undefined');
  $.checkArgument(tx instanceof Transaction || typeof tx === 'string',
    'Invalid tx given, tx must be a "string" or "Transaction"');

  let hash = tx;
  if (tx instanceof Transaction) {
    // We need to reverse the id hash for the lookup
    hash = BufferUtil.reverse(Buffer.from(tx.id, 'hex')).toString('hex');
  }

  const txs = this.getMatchedTransactionHashes();
  return txs.indexOf(hash) !== -1;
};

/**
 * @param {Buffer} br - MerkleBlock data
 * @returns {Object} - An Object representing merkleblock data
 * @private
 */
MerkleBlock._fromBufferReader = function _fromBufferReader(br) {
  $.checkState(!br.finished(), 'No merkleblock data received');
  const info = {};
  info.header = BlockHeader.fromBufferReader(br);
  info.numTransactions = br.readUInt32LE();
  const numHashes = br.readVarintNum();
  info.hashes = [];
  for (let i = 0; i < numHashes; i += 1) {
    info.hashes.push(br.read(32).toString('hex'));
  }
  const numFlags = br.readVarintNum();
  info.flags = [];
  for (let i = 0; i < numFlags; i += 1) {
    info.flags.push(br.readUInt8());
  }
  return info;
};

/**
 * @param {Object} obj - A plain JavaScript object
 * @returns {MerkleBlock} - An instance of MerkleBlock
 */
MerkleBlock.fromObject = function fromObject(obj) {
  return new MerkleBlock(obj);
};

module.exports = MerkleBlock;
