import {Network} from "./Network";
import {PublicKey} from "./PublicKey";
import {HDPublicKey} from "./HDPublicKey";
import {PrivateKey} from "./PrivateKey";
/**
 * Represents an instance of an hierarchically derived private key.
 *
 * More info on https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 *
 * @constructor
 * @param {string|Buffer|Object} arg
 */
export class HDPrivateKey {
    constructor(arg: string | Buffer | any);

    readonly hdPublicKey: HDPublicKey;
    readonly xpubkey: string;
    readonly xprivkey: string;
    readonly network: Network;
    readonly depth: Number;
    readonly publicKey: PublicKey;
    readonly privateKey: PrivateKey;
    readonly fingerPrint: Buffer;

    /**
     * Verifies that a given path is valid.
     *
     * @param {string|number} arg
     * @param {boolean?} hardened
     * @return {boolean}
     */
    static isValidPath(arg: string | number, hardened: boolean): boolean;

    /**
     * Internal function that splits a string path into a derivation index array.
     * It will return null if the string path is malformed.
     * It does not validate if indexes are in bounds.
     *
     * @param {string} path
     * @return {Array}
     */
    static _getDerivationIndexes(path: string): any[];

    /**
     * WARNING: This method is deprecated. Use deriveChild or deriveNonCompliantChild instead. This is not BIP32 compliant
     *
     *
     * Get a derived child based on a string or number.
     *
     * If the first argument is a string, it's parsed as the full path of
     * derivation. Valid values for this argument include "m" (which returns the
     * same private key), "m/0/1/40/2'/1000", where the ' quote means a hardened
     * derivation.
     *
     * If the first argument is a number, the child with that index will be
     * derived. If the second argument is truthy, the hardened version will be
     * derived. See the example usage for clarification.
     *
     * @example
     * ```javascript
     * var parent = new HDPrivateKey('xprv...');
     * var child_0_1_2h = parent.derive(0).derive(1).derive(2, true);
     * var copy_of_child_0_1_2h = parent.derive("m/0/1/2'");
     * assert(child_0_1_2h.xprivkey === copy_of_child_0_1_2h);
     * ```
     *
     * @param {string|number} arg
     * @param {boolean?} hardened
     * @return HDPrivateKey
     */
    derive(arg: string | number, hardened: boolean): HDPrivateKey;

    /**
     * WARNING: This method will not be officially supported until v1.0.0.
     *
     *
     * Get a derived child based on a string or number.
     *
     * If the first argument is a string, it's parsed as the full path of
     * derivation. Valid values for this argument include "m" (which returns the
     * same private key), "m/0/1/40/2'/1000", where the ' quote means a hardened
     * derivation.
     *
     * If the first argument is a number, the child with that index will be
     * derived. If the second argument is truthy, the hardened version will be
     * derived. See the example usage for clarification.
     *
     * WARNING: The `nonCompliant` option should NOT be used, except for older implementation
     * that used a derivation strategy that used a non-zero padded private key.
     *
     * @example
     * ```javascript
     * var parent = new HDPrivateKey('xprv...');
     * var child_0_1_2h = parent.deriveChild(0).deriveChild(1).deriveChild(2, true);
     * var copy_of_child_0_1_2h = parent.deriveChild("m/0/1/2'");
     * assert(child_0_1_2h.xprivkey === copy_of_child_0_1_2h);
     * ```
     *
     * @param {string|number} arg
     * @param {boolean?} hardened
     * @return HDPrivateKey
     */
    deriveChild(arg: string | number, hardened: boolean): HDPrivateKey;

    /**
     * WARNING: This method will not be officially supported until v1.0.0
     *
     *
     * WARNING: If this is a new implementation you should NOT use this method, you should be using
     * `derive` instead.
     *
     * This method is explicitly for use and compatibility with an implementation that
     * was not compliant with BIP32 regarding the derivation algorithm. The private key
     * must be 32 bytes hashing, and this implementation will use the non-zero padded
     * serialization of a private key, such that it's still possible to derive the privateKey
     * to recover those funds.
     *
     * @param {string|number} arg
     * @param {boolean?} hardened
     */
    deriveNonCompliantChild(arg: string | number, hardened: boolean): void;

    /**
     * Verifies that a given serialized private key in base58 with checksum format
     * is valid.
     *
     * @param {string|Buffer} data - the serialized private key
     * @param {string|Network=} network - optional, if present, checks that the
     *     network provided matches the network serialized.
     * @return {boolean}
     */
    static isValidSerialized(data: string | Buffer, network: string | Network): boolean;

    /**
     * Checks what's the error that causes the validation of a serialized private key
     * in base58 with checksum to fail.
     *
     * @param {string|Buffer} data - the serialized private key
     * @param {string|Network=} network - optional, if present, checks that the
     *     network provided matches the network serialized.
     * @return {InvalidArgument|null}
     */
    // @ts-ignore
    static getSerializedError(data: string | Buffer, network: string | Network): InvalidArgument | null;

    /**
     * Generate a private key from a seed, as described in BIP32
     *
     * @param {string|Buffer} hexa
     * @param {*} network
     * @return {HDPrivateKey}
     */
    static fromSeed(hexa: string | Buffer, network: any): HDPrivateKey;

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
     * @param {Buffer} arg.privateKey
     * @param {Buffer} arg.checksum
     * @param {string=} arg.xprivkey - if set, don't recalculate the base58
     *      representation
     * @return {HDPrivateKey} this
     */
    _buildFromBuffers(arg: {
        version: Buffer;
        depth: Buffer;
        parentFingerPrint: Buffer;
        childIndex: Buffer;
        chainCode: Buffer;
        privateKey: Buffer;
        checksum: Buffer;
        xprivkey?: string;
    }): HDPrivateKey;

    /**
     * Returns the string representation of this private key (a string starting
     * with "xprv..."
     *
     * @return {string}
     */
    toString(): string;

    /**
     * Returns the console representation of this extended private key.
     * @return {string}
     */
    inspect(): string;

    /**
     * Returns a plain object with a representation of this private key.
     *
     * Fields include:<ul>
     * <li> network: either 'livenet' or 'testnet'
     * <li> depth: a number ranging from 0 to 255
     * <li> fingerPrint: a number ranging from 0 to 2^32-1, taken from the hash of the
     * <li>     associated public key
     * <li> parentFingerPrint: a number ranging from 0 to 2^32-1, taken from the hash
     * <li>     of this parent's associated public key or zero.
     * <li> childIndex: the index from which this child was derived (or zero)
     * <li> chainCode: an hexa string representing a number used in the derivation
     * <li> privateKey: the private key associated, in hexa representation
     * <li> xprivkey: the representation of this extended private key in checksum
     * <li>     base58 format
     * <li> checksum: the base58 checksum of xprivkey
     * </ul>
     * @function
     * @return {Object}
     */
    toObject(): Object;

    /**
     * Creates an HDPrivateKey from a string representation
     *
     * @param {String} arg
     * @return {HDPrivateKey}
     */
    static fromString(arg: String): HDPrivateKey;

    /**
     * Creates an HDPrivateKey from an object
     *
     * @param {Object} arg
     * @return {HDPrivateKey}
     */
    static fromObject(arg: Buffer): HDPrivateKey;

    /**
     * Build a HDPrivateKey from a buffer
     *
     * @param {Buffer} arg
     * @return {HDPrivateKey}
     */
    static fromBuffer(arg: Buffer): HDPrivateKey;

    /**
     * Returns a buffer representation of the HDPrivateKey
     *
     * @return {Buffer}
     */
    toBuffer(): Buffer;
}
