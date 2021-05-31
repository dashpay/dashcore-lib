import { Network } from './Network';
import { bitcore } from './bitcore';
import { PublicKey } from './PublicKey';
/**
 * The representation of an hierarchically derived public key.
 *
 * See https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 *
 * @constructor
 * @param {Object|string|Buffer} arg
 */
export class HDPublicKey {
  constructor(arg: any | string | Buffer);

  readonly xpubkey: string;
  readonly network: Network;
  readonly depth: Number;
  readonly publicKey: PublicKey;
  readonly fingerPrint: Buffer;
  /**
   * Verifies that a given path is valid.
   *
   * @param {string|number} arg
   * @return {boolean}
   */
  static isValidPath(arg: string | number): boolean;

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
   * @param {boolean?} hardened
   * @return HDPublicKey
   */
  derive(arg: string | number, hardened: boolean): HDPublicKey;

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
   * @param {string|number} arg
   * @param {boolean?} hardened
   * @return HDPublicKey
   */
  deriveChild(arg: string | number, hardened: boolean): HDPublicKey;

  /**
   * Verifies that a given serialized public key in base58 with checksum format
   * is valid.
   *
   * @param {string|Buffer} data - the serialized public key
   * @param {string|Network=} network - optional, if present, checks that the
   *     network provided matches the network serialized.
   * @return {boolean}
   */
  static isValidSerialized(
    data: string | Buffer,
    network: string | Network
  ): boolean;

  /**
   * Checks what's the error that causes the validation of a serialized public key
   * in base58 with checksum to fail.
   *
   * @param {string|Buffer} data - the serialized public key
   * @param {string|Network=} network - optional, if present, checks that the
   *     network provided matches the network serialized.
   * @return {bitcore.Error|null}
   */
  static getSerializedError(
    data: string | Buffer,
    network: string | Network
  ): bitcore.Error | null;

  /**
   * Receives a object with buffers in all the properties and populates the
   * internal structure
   *
   * @param {Object} arg
   * @param {Buffer} arg.version
   * @param {Buffer} arg.depth
   * @param {Buffer} arg.parentFingerPrint
   * @param {Buffer} arg.childIndex
   * @param {Buffer} arg.chainCode
   * @param {Buffer} arg.publicKey
   * @param {Buffer} arg.checksum
   * @param {string=} arg.xpubkey - if set, don't recalculate the base58
   *      representation
   * @return {HDPublicKey} this
   */
  _buildFromBuffers(arg: {
    version: Buffer;
    depth: Buffer;
    parentFingerPrint: Buffer;
    childIndex: Buffer;
    chainCode: Buffer;
    publicKey: Buffer;
    checksum: Buffer;
    xpubkey?: string;
  }): HDPublicKey;

  /**
   * Returns the base58 checked representation of the public key
   * @return {string} a string starting with "xpub..." in livenet
   */
  toString(): string;

  /**
   * Returns the console representation of this extended public key.
   * @return {string}
   */
  inspect(): string;

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
  toObject(): object;

  /**
   * Creates an HDPublicKey from a string representation
   * @param {String} arg
   * @return {HDPublicKey}
   */
  static fromString(arg: String): HDPublicKey;

  /**
   * Creates an HDPublicKey from an object
   * @param {Object} arg
   * @return {HDPublicKey}
   */
  static fromObject(arg: Buffer): HDPublicKey;
  /**
   * Create an HDPublicKey from a buffer argument
   *
   * @param {Buffer} arg
   * @return {HDPublicKey}
   */
  static fromBuffer(arg: Buffer): HDPublicKey;

  /**
   * Return a buffer representation of the xpubkey
   *
   * @return {Buffer}
   */
  toBuffer(): Buffer;
}
