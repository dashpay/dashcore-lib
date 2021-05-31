import { Network } from './Network';
import { PublicKey } from './PublicKey';
import { Script } from './script/Script';

/**
 * Instantiate an address from an address String or Buffer, a public key or script hash Buffer,
 * or an instance of {@link PublicKey} or {@link Script}.
 *
 * This is an immutable class, and if the first parameter provided to this constructor is an
 * `Address` instance, the same argument will be returned.
 *
 * An address has two key properties: `network` and `type`. The type is either
 * `Address.PayToPublicKeyHash` (value is the `'pubkeyhash'` string)
 * or `Address.PayToScriptHash` (the string `'scripthash'`). The network is an instance of {@link Network}.
 * You can quickly check whether an address is of a given kind by using the methods
 * `isPayToPublicKeyHash` and `isPayToScriptHash`
 *
 * @example
 * ```javascript
 * // validate that an input field is valid
 * var error = Address.getValidationError(input, 'testnet');
 * if (!error) {
 *   var address = Address(input, 'testnet');
 * } else {
 *   // invalid network or checksum (typo?)
 *   var message = error.messsage;
 * }
 *
 * // get an address from a public key
 * var address = Address(publicKey, 'testnet').toString();
 * ```
 *
 * @param {*} data - The encoded data in various formats
 * @param {Network|String|number=} network - The network: 'livenet' or 'testnet'
 * @param {string=} type - The type of address: 'script' or 'pubkey'
 * @returns {Address} A new valid and frozen instance of an Address
 * @constructor
 */
export class Address {
  constructor(data: any, network: Network | string | number, type?: string);

  readonly hashBuffer: Buffer;
  readonly network: Network;
  readonly type: string;
  /**
   * Internal function used to split different kinds of arguments of the constructor
   * @param {*} data - The encoded data in various formats
   * @param {Network|String|number=} network - The network: 'livenet' or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @returns {Object} An "info" object with "type", "network", and "hashBuffer"
   */
  _classifyArguments(
    data: any,
    network: Network | string | number,
    type?: string
  ): any;

  /**
   * @static
   * @type string
   */
  static PayToPublicKeyHash: string;
  /**
   * @static
   * @type string
   */
  static PayToScriptHash: string;

  /**
   * Deserializes an address serialized through `Address#toObject()`
   * @param {Object} data
   * @param {string} data.hash - the hash that this address encodes
   * @param {string} data.type - either 'pubkeyhash' or 'scripthash'
   * @param {Network=} data.network - the name of the network associated
   * @return {Address}
   */
  static _transformObject(data: {
    hash: string;
    type: string;
    network?: Network;
  }): Address;

  /**
   * Creates a P2SH address from a set of public keys and a threshold.
   *
   * The addresses will be sorted lexicographically.
   * To create an address from unsorted public keys, use the {@link Script#buildMultisigOut}
   * interface.
   *
   * @param {Array} publicKeys - a set of public keys to create an address
   * @param {number} threshold - the number of signatures needed to release the funds
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @return {Address}
   */
  static createMultisig(
    publicKeys: any[],
    threshold: number,
    network: string | Network
  ): Address;

  /**
   * Instantiate an address from a PublicKey instance
   *
   * @param {PublicKey} data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromPublicKey(data: PublicKey, network: string | Network): Address;

  /**
   * Instantiate an address from a ripemd160 public key hash
   *
   * @param {Buffer} hash - An instance of buffer of the hash
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromPublicKeyHash(hash: Buffer, network: string | Network): Address;

  /**
   * Instantiate an address from a ripemd160 script hash
   *
   * @param {Buffer} hash - An instance of buffer of the hash
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromScriptHash(hash: Buffer, network: string | Network): Address;

  /**
   * Builds a p2sh address paying to script. This will hash the script and
   * use that to create the address.
   * If you want to extract an address associated with a script instead,
   * see {{Address#fromScript}}
   *
   * @param {Script} script - An instance of Script
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static payingTo(script: Script, network: string | Network): Address;

  /**
   * Extract address from a Script. The script must be of one
   * of the following types: p2pkh input, p2pkh output, p2sh input
   * or p2sh output.
   * This will analyze the script and extract address information from it.
   * If you want to transform any script to a p2sh Address paying
   * to that script's hash instead, use {{Address#payingTo}}
   *
   * @param {Script} script - An instance of Script
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromScript(script: Script, network: string | Network): Address;

  /**
   * Instantiate an address from a buffer of the address
   *
   * @param {Buffer} buffer - An instance of buffer of the address
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromBuffer(
    buffer: Buffer,
    network: string | Network,
    type?: string
  ): Address;

  /**
   * Instantiate an address from an address string
   *
   * @param {string} str - A string of the Dash address
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromString(
    str: string,
    network: string | Network,
    type?: string
  ): Address;

  /**
   * Instantiate an address from an Object
   *
   * @param {string} json - An JSON string or Object with keys: hash, network and type
   * @returns {Address} A new valid instance of an Address
   */
  static fromObject(json: string): Address;

  /**
   * Will return a validation error if exists
   *
   * @example
   * ```javascript
   * // a network mismatch error
   * var error = Address.getValidationError('15vkcKf7gB23wLAnZLmbVuMiiVDc1Nm4a2', 'testnet');
   * ```
   *
   * @param {string} data - The encoded data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string} type - The type of address: 'script' or 'pubkey'
   * @returns {null|Error} The corresponding error message
   */
  static getValidationError(
    data: string,
    network: string | Network,
    type: string
  ): null | Error;

  /**
   * Will return a boolean if an address is valid
   *
   * @example
   * ```javascript
   * assert(Address.isValid('15vkcKf7gB23wLAnZLmbVuMiiVDc1Nm4a2', 'livenet'));
   * ```
   *
   * @param {string} data - The encoded data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string} type - The type of address: 'script' or 'pubkey'
   * @returns {boolean} The corresponding error message
   */
  static isValid(
    data: string,
    network: string | Network,
    type: string
  ): boolean;

  /**
   * Returns true if an address is of pay to public key hash type
   * @return {boolean}
   */
  isPayToPublicKeyHash(): boolean;

  /**
   * Returns true if an address is of pay to script hash type
   * @return {boolean}
   */
  isPayToScriptHash(): boolean;

  /**
   * Will return a buffer representation of the address
   *
   * @returns {Buffer} Dash address buffer
   */
  toBuffer(): Buffer;

  /**
   * Will return an object representation of the address
   *
   * @function
   * @returns {Object} A plain object with the address information
   */
  toObject(): any;

  /**
   * Will return an object representation of the address
   *
   * @function
   * @returns {Object} A plain object with the address information
   */
  toJSON(): any;

  /**
   * Will return a string representation of the address
   *
   * @returns {string} Dash address
   */
  toString(): string;

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Dash address
   */
  inspect(): string;
}
