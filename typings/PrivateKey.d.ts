import { Network } from "./Network";
import { PublicKey } from "./PublicKey";
import { Address } from "./Address";
import { BN } from "./crypto/BN";

/**
 * Instantiate a PrivateKey from a BN, Buffer and WIF.
 *
 * @example
 * ```javascript
 * // generate a new random key
 * var key = PrivateKey();
 *
 * // get the associated address
 * var address = key.toAddress();
 *
 * // encode into wallet export format
 * var exported = key.toWIF();
 *
 * // instantiate from the exported (and saved) private key
 * var imported = PrivateKey.fromWIF(exported);
 * ```
 *
 * @param {string} data - The encoded data in various formats
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @returns {PrivateKey} A new valid instance of a PrivateKey
 * @constructor
 */
export class PrivateKey {
    constructor(data?: string, network?: Network | string);

    readonly bn: BN;
    readonly compressed: boolean;
    readonly network: Network;
    readonly publicKey: PublicKey;

    /**
     * Internal helper to instantiate PrivateKey internal `info` object from
     * different kinds of arguments passed to the constructor.
     *
     * @param {*} data
     * @param {Network|string=} network - a {@link Network} object, or a string with the network name
     * @return {Object}
     */
    _classifyArguments(data: any, network: Network | string): any;

    /**
     * Instantiate a PrivateKey from a Buffer with the DER or WIF representation
     *
     * @param {Buffer} arg
     * @param {Network} network
     * @return {PrivateKey}
     */
    static fromBuffer(arg: Buffer, network: Network): PrivateKey;

    /**
     * Instantiate a PrivateKey from a WIF string
     *
     * @function
     * @param {string} str - The WIF encoded private key string
     * @returns {PrivateKey} A new valid instance of PrivateKey
     */
    static fromString(str: string): PrivateKey;

    /**
     * Instantiate a PrivateKey from a plain JavaScript object
     *
     * @param {Object} obj - The output from privateKey.toObject()
     */
    static fromObject(obj: any): void;

    /**
     * Instantiate a PrivateKey from random bytes
     *
     * @param {string=} network - Either "livenet" or "testnet"
     * @returns {PrivateKey} A new valid instance of PrivateKey
     */
    static fromRandom(network?: string): PrivateKey;

    /**
     * Check if there would be any errors when initializing a PrivateKey
     *
     * @param {string} data - The encoded data in various formats
     * @param {string=} network - Either "livenet" or "testnet"
     * @returns {null|Error} An error if exists
     */
    static getValidationError(data: string, network?: string): null | Error;

    /**
     * Check if the parameters are valid
     *
     * @param {string} data - The encoded data in various formats
     * @param {string=} network - Either "livenet" or "testnet"
     * @returns {Boolean} If the private key is would be valid
     */
    static isValid(data: string, network?: string): boolean;

    /**
     * Will output the PrivateKey encoded as hex string
     *
     * @returns {string}
     */
    toString(): string;

    /**
     * Will output the PrivateKey to a WIF string
     *
     * @returns {string} A WIP representation of the private key
     */
    toWIF(): string;

    /**
     * Will return the private key as a BN instance
     *
     * @returns {BN} A BN instance of the private key
     */
    toBigNumber(): BN;

    /**
     * Will return the private key as a BN buffer
     *
     * @returns {Buffer} A buffer of the private key
     */
    toBuffer(): Buffer;

    /**
     * WARNING: This method will not be officially supported until v1.0.0.
     *
     *
     * Will return the private key as a BN buffer without leading zero padding
     *
     * @returns {Buffer} A buffer of the private key
     */
    toBufferNoPadding(): Buffer;

    /**
     * Will return the corresponding public key
     *
     * @returns {PublicKey} A public key generated from the private key
     */
    toPublicKey(): PublicKey;

    /**
     * Will return an address for the private key
     * @param {Network=} network - optional parameter specifying
     * the desired network for the address
     *
     * @returns {Address} An address generated from the private key
     */
    toAddress(network?: Network): Address;

    /**
     * @function
     * @returns {Object} A plain object representation
     */
    toObject(): any;

    /**
     * @function
     * @returns {Object} A plain object representation
     */
    toJSON(): any;

    /**
     * Will return a string formatted for the console
     *
     * @returns {string} Private key
     */
    inspect(): string;
}
