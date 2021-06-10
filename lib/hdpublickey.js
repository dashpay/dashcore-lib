/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var _ = require('lodash');
var $ = require('./util/preconditions');

var BN = require('./crypto/bn');
var Base58 = require('./encoding/base58');
var Base58Check = require('./encoding/base58check');
var Hash = require('./crypto/hash');
var HDPrivateKey = require('./hdprivatekey');
var Network = require('./networks');
var Point = require('./crypto/point');
var PublicKey = require('./publickey');

var bitcoreErrors = require('./errors');
var errors = bitcoreErrors;
var hdErrors = bitcoreErrors.HDPublicKey;
var assert = require('assert');

var JSUtil = require('./util/js');
var BufferUtil = require('./util/buffer');

/**
 * The representation of an hierarchically derived public key.
 *
 * See https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 *
 * @constructor
 * @param {Object|string|Buffer} arg
 */
function HDPublicKey(arg) {
  /* jshint maxcomplexity: 12 */
  /* jshint maxstatements: 20 */
  if (arg instanceof HDPublicKey) {
    return arg;
  }
  if (!(this instanceof HDPublicKey)) {
    return new HDPublicKey(arg);
  }
  if (arg) {
    if (_.isString(arg) || BufferUtil.isBuffer(arg)) {
      var error = HDPublicKey.getSerializedError(arg);
      if (!error) {
        return this._buildFromSerialized(arg);
      } else if (
        BufferUtil.isBuffer(arg) &&
        !HDPublicKey.getSerializedError(arg.toString())
      ) {
        return this._buildFromSerialized(arg.toString());
      } else {
        if (error instanceof hdErrors.ArgumentIsPrivateExtended) {
          return new HDPrivateKey(arg).hdPublicKey;
        }
        throw error;
      }
    } else {
      if (_.isObject(arg)) {
        if (arg instanceof HDPrivateKey) {
          return this._buildFromPrivate(arg);
        } else {
          return this._buildFromObject(arg);
        }
      } else {
        throw new hdErrors.UnrecognizedArgument(arg);
      }
    }
  } else {
    throw new hdErrors.MustSupplyArgument();
  }
}

/**
 * Verifies that a given path is valid.
 *
 * @param {string|number} arg
 * @return {boolean}
 */
HDPublicKey.isValidPath = function (arg) {
  if (_.isString(arg)) {
    var indexes = HDPrivateKey._getDerivationIndexes(arg);
    return indexes !== null && _.every(indexes.map(index=>index.value), HDPublicKey.isValidPath);

  }

  if (_.isNumber(arg)) {
    return arg >= 0 && arg < HDPublicKey.Hardened;
  }

  if (BN.isBN(arg)) {
    return arg.gte(HDPrivateKey.MaxIndex32bit) && arg.lt(HDPrivateKey.MaxIndex256bit)
  }

  return false;
};

/**
 * WARNING: This method is deprecated. Use deriveChild instead.
 *
 *
 * Get a derivated child based on a string or number.
 *
 * If the first argument is a string, it's parsed as the full path of
 * derivation. Valid values for this argument include "m" (which returns the
 * same public key), "m/0/1/40/2/1000".
 *
 * Note that hardened keys can't be derived from a public extended key.
 *
 * If the first argument is a number, the child with that index will be
 * derived. See the example usage for clarification.
 *
 * @example
 * ```javascript
 * var parent = new HDPublicKey('xpub...');
 * var child_0_1_2 = parent.derive(0).derive(1).derive(2);
 * var copy_of_child_0_1_2 = parent.derive("m/0/1/2");
 * assert(child_0_1_2.xprivkey === copy_of_child_0_1_2);
 * ```
 *
 * @param {string|number} arg
 * @param {boolean} [hardened=false]
 * @return HDPublicKey
 */
HDPublicKey.prototype.derive = function (arg, hardened) {
  return this.deriveChild(arg, hardened);
};

/**
 * WARNING: This method will not be officially supported until v1.0.0.
 *
 *
 * Get a derivated child based on a string or number.
 *
 * If the first argument is a string, it's parsed as the full path of
 * derivation. Valid values for this argument include "m" (which returns the
 * same public key), "m/0/1/40/2/1000".
 *
 * Note that hardened keys can't be derived from a public extended key.
 *
 * If the first argument is a number, the child with that index will be
 * derived. See the example usage for clarification.
 *
 * @example
 * ```javascript
 * var parent = new HDPublicKey('xpub...');
 * var child_0_1_2 = parent.deriveChild(0).deriveChild(1).deriveChild(2);
 * var copy_of_child_0_1_2 = parent.deriveChild("m/0/1/2");
 * assert(child_0_1_2.xprivkey === copy_of_child_0_1_2);
 * ```
 *
 * @param {string|number} arg - string can be a path or a DIP14 256-bit hex, number is only used for BIP32 compatibility
 * @param {boolean?} hardened
 * @return HDPublicKey
 */
HDPublicKey.prototype.deriveChild = function (arg, hardened) {
  // DIP14 256-bit Mode
  if (HDPrivateKey._isIndex256bit(arg)) {
    return this._deriveWithBigNumber(HDPrivateKey._IndexArgToBN(arg), hardened);
  }
  // BIP32 Compatibility Mode
  else if (!_.isNaN(HDPrivateKey._IndexArgToNumber(arg, {castStringToNumber: false}))) {
    return this._deriveWithNumber(HDPrivateKey._IndexArgToNumber(arg, { castStringToNumber: false }), hardened);
  }
  // Mixed BIP32 and DIP14 path
  else if (_.isString(arg)) {
      return this._deriveFromString(arg);
    }
  else {
    throw new hdErrors.InvalidDerivationArgument(arg);
  }
};

HDPublicKey.prototype._deriveWithNumber = function (index, hardened) {
  if (index >= HDPublicKey.Hardened || hardened) {
    throw new hdErrors.InvalidIndexCantDeriveHardened();
  }
  if (index < 0) {
    throw new hdErrors.InvalidPath(index);
  }

  var indexBuffer = BufferUtil.integerAsBuffer(index);
  var data = BufferUtil.concat([this.publicKey.toBuffer(), indexBuffer]);
  var hash = Hash.sha512hmac(data, this._buffers.chainCode);
  var leftPart = BN.fromBuffer(hash.slice(0, 32), { size: 32 });
  var chainCode = hash.slice(32, 64);

  var publicKey;
  try {
    publicKey = PublicKey.fromPoint(
      Point.getG().mul(leftPart).add(this.publicKey.point)
    );
  } catch (e) {
    return this._deriveWithNumber(index + 1);
  }

  var derived = new HDPublicKey({
    network: this.network,
    depth: this.depth + 1,
    parentFingerPrint: this.fingerPrint,
    childIndex: index,
    chainCode: chainCode,
    publicKey: publicKey,
  });

  return derived;
};

HDPublicKey.prototype._deriveWithBigNumber = function(index, hardened) {
  if (hardened) {
    throw new hdErrors.InvalidIndexCantDeriveHardened();
  }
  if (!HDPublicKey.isValidPath(index)) {
    throw new hdErrors.InvalidPath(index);
  }

  var indexBuffer = index.toBuffer({size: 32})
  var data = BufferUtil.concat([this.publicKey.toBuffer(), indexBuffer]);
  var hash = Hash.sha512hmac(data, this._buffers.chainCode);
  var leftPart = BN.fromBuffer(hash.slice(0, 32), {size: 32});
  var chainCode = hash.slice(32, 64);

  var publicKey;
  try {
    publicKey = PublicKey.fromPoint(Point.getG().mul(leftPart).add(this.publicKey.point));
  } catch (e) {
    return this._deriveWithBigNumber(index.iaddn(1));
  }
  var derived = new HDPublicKey({
    network: this.network,
    depth: this.depth + 1,
    parentFingerPrint: this.fingerPrint,
    childIndex: index,
    chainCode: chainCode,
    publicKey: publicKey
  });

  return derived;
};

HDPublicKey.prototype._deriveFromString = function (path) {
  /* jshint maxcomplexity: 8 */
  if (_.includes(path, "'")) {
    throw new hdErrors.InvalidIndexCantDeriveHardened();
  } else if (!HDPublicKey.isValidPath(path)) {
    throw new hdErrors.InvalidPath(path);
  }

  var indexes = HDPrivateKey._getDerivationIndexes(path);

  var derived = indexes.map(index=>index.value).reduce(function(prev, index) {
    return _.isNumber(index) ? prev._deriveWithNumber(index) : prev._deriveWithBigNumber(index);
  }, this);

  return derived;
};

/**
 * Verifies that a given serialized public key in base58 with checksum format
 * is valid.
 *
 * @param {string|Buffer} data - the serialized public key
 * @param {string|Network=} network - optional, if present, checks that the
 *     network provided matches the network serialized.
 * @return {boolean}
 */
HDPublicKey.isValidSerialized = function (data, network) {
  return _.isNull(HDPublicKey.getSerializedError(data, network));
};

/**
 * Checks what's the error that causes the validation of a serialized public key
 * in base58 with checksum to fail.
 *
 * @param {string|Buffer} data - the serialized public key
 * @param {string|Network=} network - optional, if present, checks that the
 *     network provided matches the network serialized.
 * @return {bitcore.Error|null}
 */
HDPublicKey.getSerializedError = function (data, network) {
  /* jshint maxcomplexity: 10 */
  /* jshint maxstatements: 20 */
  if (!(_.isString(data) || BufferUtil.isBuffer(data))) {
    return new hdErrors.UnrecognizedArgument('expected buffer or string');
  }
  if (!Base58.validCharacters(data)) {
    return new errors.InvalidB58Char('(unknown)', data);
  }
  try {
    data = Base58Check.decode(data);
  } catch (e) {
    return new errors.InvalidB58Checksum(data);
  }
  if (![HDPublicKey.DataSize, HDPublicKey.DataSize256bit].includes(data.length)) {
    return new hdErrors.InvalidLength(data);
  }
  if (!_.isUndefined(network)) {
    var error = HDPublicKey._validateNetwork(data, network);
    if (error) {
      return error;
    }
  }
  var version = BufferUtil.integerFromBuffer(data.slice(0, 4));
  if (
    version === Network.livenet.xprivkey ||
    version === Network.testnet.xprivkey ||
    version === Network.livenet.xprivkey256bit ||
    version === Network.testnet.xprivkey256bit
  ) {
    return new hdErrors.ArgumentIsPrivateExtended();
  }
  return null;
};

HDPublicKey._validateNetwork = function (data, networkArg) {
  var network = Network.get(networkArg);
  if (!network) {
    return new errors.InvalidNetworkArgument(networkArg);
  }

  var version = data.slice(HDPublicKey.VersionStart, HDPublicKey.VersionEnd);
  var versionInt = BufferUtil.integerFromBuffer(version)

  if (data.length === HDPublicKey.DataSize && versionInt !== network.xpubkey)
    return new errors.InvalidNetwork(version);

  if (data.length === HDPublicKey.DataSize256bit && versionInt !== network.xpubkey256bit)
    return new errors.InvalidNetwork(version);

  return null;
};

HDPublicKey.prototype._buildFromPrivate = function (arg) {
  var args = _.clone(arg._buffers);
  var point = Point.getG().mul(BN.fromBuffer(args.privateKey));
  var versionKey = HDPrivateKey._isIndex256bit(arg._buffers.childIndex) ? 'xpubkey256bit' : 'xpubkey'

  args.publicKey = Point.pointToCompressed(point);
  args.version = BufferUtil.integerAsBuffer(
    Network.get(BufferUtil.integerFromBuffer(args.version))[versionKey]
  );
  args.privateKey = undefined;
  args.checksum = undefined;
  args.xprivkey = undefined;
  return this._buildFromBuffers(args);
};

HDPublicKey.prototype._buildFromObject = function (arg) {
  /* jshint maxcomplexity: 10 */
  // TODO: Type validation
  var versionKey, childIndex, hardened

  // DIP14 256-bit Mode
  if (HDPrivateKey._isIndex256bit(arg.childIndex)) {
    versionKey = 'xpubkey256bit'
    childIndex = HDPrivateKey._index256bitToBuffer(arg.childIndex)
    hardened = _.isBoolean(arg.hardened) ? BufferUtil.integerAsSingleByteBuffer(arg.hardened ? 1 : 0) : BufferUtil.emptyBuffer(1)
  }
  // BIP32 Compatibility Mode
  else {
    versionKey = 'xpubkey'
    childIndex =  HDPrivateKey._index32bitToBuffer(arg.childIndex)
    hardened = undefined
  }

  var buffers = {
    version: arg.network
      ? BufferUtil.integerAsBuffer(Network.get(arg.network)[versionKey])
      : arg.version,
    depth: _.isNumber(arg.depth)
      ? BufferUtil.integerAsSingleByteBuffer(arg.depth)
      : arg.depth,
    parentFingerPrint: _.isNumber(arg.parentFingerPrint)
      ? BufferUtil.integerAsBuffer(arg.parentFingerPrint) : arg.parentFingerPrint,
    hardened: hardened,
    childIndex: childIndex,
    chainCode: _.isString(arg.chainCode)
      ? BufferUtil.hexToBuffer(arg.chainCode)
      : arg.chainCode,
    publicKey: _.isString(arg.publicKey)
      ? BufferUtil.hexToBuffer(arg.publicKey)
      : BufferUtil.isBuffer(arg.publicKey)
        ? arg.publicKey
        : arg.publicKey.toBuffer(),
    checksum: _.isNumber(arg.checksum)
      ? BufferUtil.integerAsBuffer(arg.checksum)
      : arg.checksum
  };
  return this._buildFromBuffers(buffers);
};

HDPublicKey.prototype._buildFromSerialized = function (arg) {
  var decoded = Base58Check.decode(arg);

  var buffers

  if (decoded.length === HDPublicKey.DataSize256bit) {
    buffers = {
      version: decoded.slice(
        HDPublicKey.VersionStart,
        HDPublicKey.VersionEnd
      ),
      depth: decoded.slice(
        HDPublicKey.DepthStart,
        HDPublicKey.DepthEnd
      ),
      parentFingerPrint: decoded.slice(
        HDPublicKey.ParentFingerPrintStart,
        HDPublicKey.ParentFingerPrintEnd
      ),
      hardened: decoded.slice(
        HDPublicKey.HardenedStart,
        HDPublicKey.HardenedEnd
      ),
      childIndex: decoded.slice(
        HDPublicKey.ChildIndexStart256bit,
        HDPublicKey.ChildIndexEnd256bit
      ),
      chainCode: decoded.slice(
        HDPublicKey.ChainCodeStart256bit,
        HDPublicKey.ChainCodeEnd256bit
      ),
      publicKey: decoded.slice(
        HDPublicKey.PublicKeyStart256bit,
        HDPublicKey.PublicKeyEnd256bit
      ),
      checksum: decoded.slice(
        HDPublicKey.ChecksumStart256bit,
        HDPublicKey.ChecksumEnd256bit
      ),
      xpubkey: arg
    };
  } else {
    buffers = {
      version: decoded.slice(
        HDPublicKey.VersionStart,
        HDPublicKey.VersionEnd
      ),
      depth: decoded.slice(
        HDPublicKey.DepthStart,
        HDPublicKey.DepthEnd
      ),
      parentFingerPrint: decoded.slice(
        HDPublicKey.ParentFingerPrintStart,
        HDPublicKey.ParentFingerPrintEnd
      ),
      childIndex: decoded.slice(
        HDPublicKey.ChildIndexStart,
        HDPublicKey.ChildIndexEnd
      ),
      chainCode: decoded.slice(
        HDPublicKey.ChainCodeStart,
        HDPublicKey.ChainCodeEnd
      ),
      publicKey: decoded.slice(
        HDPublicKey.PublicKeyStart,
        HDPublicKey.PublicKeyEnd
      ),
      checksum: decoded.slice(
        HDPublicKey.ChecksumStart,
        HDPublicKey.ChecksumEnd
      ),
      xpubkey: arg
    };
  }
  return this._buildFromBuffers(buffers);
};

/**
 * Receives a object with buffers in all the properties and populates the
 * internal structure
 *
 * @param {Object} arg
 * @param {Buffer} arg.version
 * @param {Buffer} arg.depth
 * @param {Buffer} arg.parentFingerPrint
 * @param {Buffer} arg.hardened - only used for DIP14 256-bit derivation paths
 * @param {Buffer} arg.childIndex
 * @param {Buffer} arg.chainCode
 * @param {Buffer} arg.publicKey
 * @param {Buffer} arg.checksum
 * @param {string=} arg.xpubkey - if set, don't recalculate the base58
 *      representation
 * @return {HDPublicKey} this
 */

HDPublicKey.prototype._buildFromBuffers = function (arg) {
  /* jshint maxcomplexity: 8 */
  /* jshint maxstatements: 20 */

  HDPublicKey._validateBufferArguments(arg);

  JSUtil.defineImmutable(this, {
    _buffers: arg,
  });


  var sequence;

  // DIP14 256-bit Mode
  if (arg.childIndex.length === HDPublicKey.ChildIndexSize256bit) {
    sequence = [
      arg.version,
      arg.depth,
      arg.parentFingerPrint,
      arg.hardened || BufferUtil.emptyBuffer(1),
      arg.childIndex,
      arg.chainCode,
      arg.publicKey
    ];
  }
  // BIP32 Compatibility Mode
  else {
    sequence = [
      arg.version,
      arg.depth,
      arg.parentFingerPrint,
      arg.childIndex,
      arg.chainCode,
      arg.publicKey
    ];
  }

  var concat = BufferUtil.concat(sequence);
  var checksum = Base58Check.checksum(concat);
  if (!arg.checksum || !arg.checksum.length) {
    arg.checksum = checksum;
  } else {
    if (arg.checksum.toString('hex') !== checksum.toString('hex')) {
      throw new errors.InvalidB58Checksum(concat, checksum);
    }
  }
  var network = Network.get(BufferUtil.integerFromBuffer(arg.version));

  var xpubkey;
  xpubkey = Base58Check.encode(BufferUtil.concat(sequence));
  arg.xpubkey = Buffer.from(xpubkey);

  var publicKey = new PublicKey(arg.publicKey, { network: network });
  var size = HDPublicKey.ParentFingerPrintSize;
  var fingerPrint = Hash.sha256ripemd160(publicKey.toBuffer()).slice(0, size);

  JSUtil.defineImmutable(this, {
    xpubkey: xpubkey,
    network: network,
    depth: BufferUtil.integerFromSingleByteBuffer(arg.depth),
    publicKey: publicKey,
    fingerPrint: fingerPrint,
  });

  return this;
};

HDPublicKey._validateBufferArguments = function (arg) {
  var checkBuffer = function (name, size) {
    var buff = arg[name];
    assert(
      BufferUtil.isBuffer(buff),
      name + " argument is not a buffer, it's " + typeof buff
    );
    assert(
      buff.length === size,
      name +
        ' has not the expected size: found ' +
        buff.length +
        ', expected ' +
        size
    );
  };
  checkBuffer('version', HDPublicKey.VersionSize);
  checkBuffer('depth', HDPublicKey.DepthSize);
  checkBuffer('parentFingerPrint', HDPublicKey.ParentFingerPrintSize);
  checkBuffer('chainCode', HDPublicKey.ChainCodeSize);
  checkBuffer('publicKey', HDPublicKey.PublicKeySize);
  if (arg.checksum && arg.checksum.length) {
    checkBuffer('checksum', HDPublicKey.CheckSumSize);
  }
  assert(BufferUtil.isBuffer(arg.childIndex), 'childIndex argument is not a buffer');
  if (arg['childIndex'].length === HDPublicKey.ChildIndexSize256bit) {
    checkBuffer('hardened', HDPublicKey.HardenedSize)
  }
  else {
    checkBuffer('childIndex', HDPublicKey.ChildIndexSize)
  }
};

/**
 * Creates an HDPublicKey from a string representation
 * @param {String} arg
 * @return {HDPublicKey}
 */
HDPublicKey.fromString = function (arg) {
  $.checkArgument(_.isString(arg), 'No valid string was provided');
  return new HDPublicKey(arg);
};

/**
 * Creates an HDPublicKey from an object
 * @param {Object} arg
 * @return {HDPublicKey}
 */
HDPublicKey.fromObject = function (arg) {
  $.checkArgument(_.isObject(arg), 'No valid argument was provided');
  return new HDPublicKey(arg);
};

/**
 * Returns the base58 checked representation of the public key
 * @return {string} a string starting with "xpub..." in livenet
 */
HDPublicKey.prototype.toString = function () {
  return this.xpubkey;
};

/**
 * Returns the console representation of this extended public key.
 * @return {string}
 */
HDPublicKey.prototype.inspect = function () {
  return '<HDPublicKey: ' + this.xpubkey + '>';
};

/**
 * Returns a plain JavaScript object with information to reconstruct a key.
 *
 * Fields are: <ul>
 *  <li> network: 'livenet' or 'testnet'
 *  <li> depth: a number from 0 to 255, the depth to the master extended key
 *  <li> fingerPrint: a number of 32 bits taken from the hash of the public key
 *  <li> fingerPrint: a number of 32 bits taken from the hash of this key's
 *  <li>     parent's public key
 *  <li> childIndex: index with which this key was derived
 *  <li> chainCode: string in hexa encoding used for derivation
 *  <li> publicKey: string, hexa encoded, in compressed key format
 *  <li> checksum: BufferUtil.integerFromBuffer(this._buffers.checksum),
 *  <li> xpubkey: the string with the base58 representation of this extended key
 *  <li> checksum: the base58 checksum of xpubkey
 * </ul>
 *
 * returns {object}
 */
HDPublicKey.prototype.toObject = HDPublicKey.prototype.toJSON =
  function toObject() {
    var versionKey, childIndex, hardened

    // DIP14 256-bit Mode
    if (this._buffers.length === HDPublicKey.ChildIndexSize256bit) {
      versionKey = 'xprivkey256bit'
      childIndex = '0x' + Buffer.from(this._buffers.childIndex).toString('hex')
      hardened = BufferUtil.integerFromBuffer(this._buffers.hardened) ? true : false
    }

    // BIP32 Compatibility Mode
    else {
      versionKey = 'xprivkey'
      childIndex = BufferUtil.integerFromBuffer(this._buffers.childIndex)
      hardened = undefined
    }

    return {
      network: Network.get(BufferUtil.integerFromBuffer(this._buffers.version)).name,
      depth: BufferUtil.integerFromSingleByteBuffer(this._buffers.depth),
      fingerPrint: BufferUtil.integerFromBuffer(this.fingerPrint),
      parentFingerPrint: BufferUtil.integerFromBuffer(this._buffers.parentFingerPrint),
      hardened: hardened,
      childIndex: BufferUtil.integerFromBuffer(this._buffers.childIndex),
      chainCode: BufferUtil.bufferToHex(this._buffers.chainCode),
      publicKey: this.publicKey.toString(),
      checksum: BufferUtil.integerFromBuffer(this._buffers.checksum),
      xpubkey: this.xpubkey
    };
  }

/**
 * Create a HDPublicKey from a buffer argument
 *
 * @param {Buffer} arg
 * @return {HDPublicKey}
 */
HDPublicKey.fromBuffer = function (arg) {
  return new HDPublicKey(arg);
};

/**
 * Return a buffer representation of the xpubkey
 *
 * @return {Buffer}
 */
HDPublicKey.prototype.toBuffer = function () {
  return BufferUtil.copy(this._buffers.xpubkey);
};

HDPublicKey.Hardened = 0x80000000;
HDPublicKey.RootElementAlias = ['m', 'M'];

HDPublicKey.MaxIndex32bit = new BN(HDPrivateKey.MaxIndex)
HDPublicKey.MaxIndex256bit = new BN('10000000000000000000000000000000000000000000000000000000000000000', 16) // n2.pow(n256).toString('hex')

HDPublicKey.VersionSize = 4;
HDPublicKey.DepthSize = 1;
HDPublicKey.ParentFingerPrintSize = 4;
HDPublicKey.HardenedSize = 1;
HDPublicKey.ChildIndexSize = 4;
HDPublicKey.ChildIndexSize256bit = 32;
HDPublicKey.ChainCodeSize = 32;
HDPublicKey.PublicKeySize = 33;
HDPublicKey.CheckSumSize = 4;

HDPublicKey.DataSize = 78;
HDPublicKey.DataSize256bit = 107;
HDPublicKey.SerializedByteSize = 82;
HDPublicKey.SerializedByteSize256bit = 111;

HDPublicKey.VersionStart = 0;
HDPublicKey.VersionEnd = HDPublicKey.VersionStart + HDPublicKey.VersionSize;
HDPublicKey.DepthStart = HDPublicKey.VersionEnd;
HDPublicKey.DepthEnd = HDPublicKey.DepthStart + HDPublicKey.DepthSize;
HDPublicKey.ParentFingerPrintStart = HDPublicKey.DepthEnd;
HDPublicKey.ParentFingerPrintEnd =
  HDPublicKey.ParentFingerPrintStart + HDPublicKey.ParentFingerPrintSize;
HDPublicKey.ChildIndexStart = HDPublicKey.ParentFingerPrintEnd;
HDPublicKey.ChildIndexEnd =
  HDPublicKey.ChildIndexStart + HDPublicKey.ChildIndexSize;
HDPublicKey.ChainCodeStart = HDPublicKey.ChildIndexEnd;
HDPublicKey.ChainCodeEnd =
  HDPublicKey.ChainCodeStart + HDPublicKey.ChainCodeSize;
HDPublicKey.PublicKeyStart = HDPublicKey.ChainCodeEnd;
HDPublicKey.PublicKeyEnd =
  HDPublicKey.PublicKeyStart + HDPublicKey.PublicKeySize;
HDPublicKey.ChecksumStart = HDPublicKey.PublicKeyEnd;
HDPublicKey.ChecksumEnd = HDPublicKey.ChecksumStart + HDPublicKey.CheckSumSize;

HDPublicKey.HardenedStart = HDPublicKey.ParentFingerPrintEnd;
HDPublicKey.HardenedEnd = HDPublicKey.HardenedStart+HDPublicKey.HardenedSize;
HDPublicKey.ChildIndexStart256bit = HDPublicKey.HardenedEnd
HDPublicKey.ChildIndexEnd256bit = HDPublicKey.ChildIndexStart256bit + HDPublicKey.ChildIndexSize256bit;
HDPublicKey.ChainCodeStart256bit = HDPublicKey.ChildIndexEnd256bit;
HDPublicKey.ChainCodeEnd256bit = HDPublicKey.ChainCodeStart256bit + HDPublicKey.ChainCodeSize;
HDPublicKey.PublicKeyStart256bit = HDPublicKey.ChainCodeEnd256bit;
HDPublicKey.PublicKeyEnd256bit = HDPublicKey.PublicKeyStart256bit + HDPublicKey.PublicKeySize;
HDPublicKey.ChecksumStart256bit = HDPublicKey.PublicKeyEnd256bit;
HDPublicKey.ChecksumEnd256bit = HDPublicKey.ChecksumStart256bit + HDPublicKey.CheckSumSize;

assert(HDPublicKey.PublicKeyEnd === HDPublicKey.DataSize);
assert(HDPublicKey.PublicKeyEnd256bit === HDPublicKey.DataSize256bit);
assert(HDPublicKey.ChecksumEnd === HDPublicKey.SerializedByteSize);
assert(HDPublicKey.ChecksumEnd256bit === HDPublicKey.SerializedByteSize256bit);

module.exports = HDPublicKey;
