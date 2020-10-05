import {Address} from "./Address"
import {Network} from "./Network"
import {PrivateKey} from "./PrivateKey"
import {Point} from "./crypto/Point"
import {Signature} from "./crypto/Signature";
import {Transaction} from "./transaction/Transaction";

/**
 * Instantiate a PublicKey from a {@link PrivateKey}, {@link Point}, `string`, or `Buffer`.
 *
 * There are two internal properties, `network` and `compressed`, that deal with importing
 * a PublicKey from a PrivateKey in WIF format. More details described on {@link PrivateKey}
 *
 * @example
 * ```javascript
 * // instantiate from a private key
 * var key = PublicKey(privateKey, true);
 *
 * // export to as a DER hex encoded string
 * var exported = key.toString();
 *
 * // import the public key
 * var imported = PublicKey.fromString(exported);
 * ```
 *
 * @param {string} data - The encoded data in various formats
 * @param {Object} extra - additional options
 * @param {Network=} extra.network - Which network should the address for this public key be for
 * @param {Boolean=} extra.compressed - If the public key is compressed
 * @returns {PublicKey} A new valid instance of a PublicKey
 * @constructor
 */
export class PublicKey {
    constructor(data?: string, extra?: {
        network?: Network;
        compressed?: string;
    });

    id: Buffer;
    hash: Buffer;
    readonly network: Network;
    readonly compressed: Boolean;
    readonly point: Point;

    /**
     * Internal function to differentiate between arguments passed to the constructor
     * @param {*} data
     * @param {Object} extra
     */
    _classifyArgs(data: any, extra: any): void;

    /**
     * Instantiate a PublicKey from a PrivateKey
     *
     * @param {PrivateKey} privkey - An instance of PrivateKey
     * @returns {PublicKey} A new valid instance of PublicKey
     */
    static fromPrivateKey(privkey: PrivateKey): PublicKey;

    /**
     * Instantiate a PublicKey from a Buffer
     *
     * @function
     * @param {Buffer} buf - A DER hex buffer
     * @param {bool=} strict - if set to false, will loosen some conditions
     * @returns {PublicKey} A new valid instance of PublicKey
     */
    static fromDER(buf: Buffer, strict?: boolean): PublicKey;

    /**
     * Instantiate a PublicKey from a Point
     *
     * @param {Point} point - A Point instance
     * @param {boolean=} compressed - whether to store this public key as compressed format
     * @returns {PublicKey} A new valid instance of PublicKey
     */
    static fromPoint(point: Point, compressed?: boolean): PublicKey;

    /**
     * Instantiate a PublicKey from a DER hex encoded string
     *
     * @param {string} str - A DER hex string
     * @param {String=} encoding - The type of string encoding
     * @returns {PublicKey} A new valid instance of PublicKey
     */
    static fromString(str: string, encoding?: string): PublicKey;

    /**
     * Instantiate a PublicKey from an X Point
     *
     * @param {Boolean} odd - If the point is above or below the x axis
     * @param {Point} x - The x point
     * @returns {PublicKey} A new valid instance of PublicKey
     */
    static fromX(odd: boolean, x: Point): PublicKey;

    /**
     * Check if there would be any errors when initializing a PublicKey
     *
     * @param {string} data - The encoded data in various formats
     * @returns {null|Error} An error if exists
     */
    static getValidationError(data: string): null | Error;

    /**
     * Check if the parameters are valid
     *
     * @param {string} data - The encoded data in various formats
     * @returns {Boolean} If the public key would be valid
     */
    static isValid(data: string): boolean;

    /**
     * @function
     * @returns {Object} A plain object of the PublicKey
     */
    toObject(): any;

    /**
     * @function
     * @returns {Object} A plain object of the PublicKey
     */
    toJSON(): any;

    /**
     * Will output the PublicKey to a DER Buffer
     *
     * @function
     * @returns {Buffer} A DER hex encoded buffer
     */
    toBuffer(): Buffer;

    /**
     * Will output the PublicKey to a DER Buffer
     *
     * @function
     * @returns {Buffer} A DER hex encoded buffer
     */
    toDER(): Buffer;

    /**
     * Will return a sha256 + ripemd160 hash of the serialized public key
     * @see https://github.com/bitcoin/bitcoin/blob/master/src/pubkey.h#L141
     * @returns {Buffer}
     */
    _getID(): Buffer;

    /**
     * Will return an address for the public key
     *
     * @param {String|Network=} network - Which network should the address be for
     * @returns {Address} An address generated from the public key
     */
    toAddress(network: string | Network): Address;

    /**
     * Will output the PublicKey to a DER encoded hex string
     *
     * @returns {string} A DER hex encoded string
     */
    toString(): string;

    /**
     * Will return a string formatted for the console
     *
     * @returns {string} Public key
     */
    inspect(): string;
}
/**
 * Represents a special kind of input of PayToPublicKey kind.
 * @constructor
 */
export class PublicKeyInput {
    constructor();

    /**
     * @param {Transaction} transaction - the transaction to be signed
     * @param {PrivateKey} privateKey - the private key with which to sign the transaction
     * @param {number} index - the index of the input in the transaction input vector
     * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
     * @return {Array} of objects that can be
     */
    getSignatures(transaction: Transaction, privateKey: PrivateKey, index: number, sigtype?: number): any[];

    /**
     * Add the provided signature
     *
     * @param {Object} signature
     * @param {PublicKey} signature.publicKey
     * @param {Signature} signature.signature
     * @param {number=} signature.sigtype
     * @return {PublicKeyInput} this, for chaining
     */
    addSignature(signature: {
        publicKey: PublicKey;
        signature: Signature;
        sigtype?: number;
    }): PublicKeyInput;

    /**
     * Clear the input's signature
     * @return {PublicKeyHashInput} this, for chaining
     */
    clearSignatures(): PublicKeyHashInput;

    /**
     * Query whether the input is signed
     * @return {boolean}
     */
    isFullySigned(): boolean;
}
/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 * @constructor
 */
export class PublicKeyHashInput {
    constructor();

    /**
     * @param {Transaction} transaction - the transaction to be signed
     * @param {PrivateKey} privateKey - the private key with which to sign the transaction
     * @param {number} index - the index of the input in the transaction input vector
     * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
     * @param {Buffer=} hashData - the precalculated hash of the public key associated with the privateKey provided
     * @return {Array} of objects that can be
     */
    getSignatures(transaction: Transaction, privateKey: PrivateKey, index: number, sigtype?: number, hashData?: Buffer): any[];

    /**
     * Add the provided signature
     *
     * @param {Object} signature
     * @param {PublicKey} signature.publicKey
     * @param {Signature} signature.signature
     * @param {number=} signature.sigtype
     * @return {PublicKeyHashInput} this, for chaining
     */
    addSignature(signature: {
        publicKey: PublicKey;
        signature: Signature;
        sigtype?: number;
    }): PublicKeyHashInput;

    /**
     * Clear the input's signature
     * @return {PublicKeyHashInput} this, for chaining
     */
    clearSignatures(): PublicKeyHashInput;

    /**
     * Query whether the input is signed
     * @return {boolean}
     */
    isFullySigned(): boolean;
}
