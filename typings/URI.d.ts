/**
 * Bitcore URI
 *
 * Instantiate an URI from a Bitcoin URI String or an Object. A URI instance
 * can be created with a Bitcoin URI string or an object. All instances of
 * URI are valid, the static method isValid allows checking before instantiation.
 *
 * All standard parameters can be found as members of the class, the address
 * is represented using an {Address} instance and the amount is represented in
 * satoshis. Any other non-standard parameters can be found under the extra member.
 *
 * @example
 * ```javascript
 *
 * var uri = new URI('dash:XsV4GHVKGTjQFvwB7c6mYsGV3Mxf7iser6?amount=1.2');
 * console.log(uri.address, uri.amount);
 * ```
 *
 * @param {string|Object} data - A Bitcoin URI string or an Object
 * @param {Array.<string>=} knownParams - Required non-standard params
 * @throws {TypeError} Invalid bitcoin address
 * @throws {TypeError} Invalid amount
 * @throws {Error} Unknown required argument
 * @returns {URI} A new valid and frozen instance of URI
 * @constructor
 */
import { Address } from './Address';
import { Network } from './Network';

export class URI {
  constructor(data: string | any, knownParams?: string[]);

  extras: Object;
  knownParams: any[];
  address: Address;
  network: Network;
  amount: Number;
  message: any;

  /**
   * Instantiate a URI from a String
   *
   * @param {string} str - JSON string or object of the URI
   * @returns {URI} A new instance of a URI
   */
  static fromString(str: string): URI;

  /**
   * Instantiate a URI from an Object
   *
   * @param {Object} data - object of the URI
   * @returns {URI} A new instance of a URI
   */
  static fromObject(data: any): URI;

  /**
   * Check if an bitcoin URI string is valid
   *
   * @example
   * ```javascript
   *
   * var valid = URI.isValid('dash:XsV4GHVKGTjQFvwB7c6mYsGV3Mxf7iser6');
   * // true
   * ```
   *
   * @param {string|Object} data - A bitcoin URI string or an Object
   * @param {Array.<string>=} knownParams - Required non-standard params
   * @returns {boolean} Result of uri validation
   */
  static isValid(data: string | any, knownParams?: string[]): boolean;

  /**
   * Convert a bitcoin URI string into a simple object.
   *
   * @param {string} uri - A bitcoin URI string
   * @throws {TypeError} Invalid bitcoin URI
   * @returns {Object} An object with the parsed params
   */
  static parse(uri: string): any;

  /**
   * Internal function to load the URI instance with an object.
   *
   * @param {Object} obj - Object with the information
   * @throws {TypeError} Invalid bitcoin address
   * @throws {TypeError} Invalid amount
   * @throws {Error} Unknown required argument
   */
  _fromObject(obj: any): void;

  /**
   * Internal function to transform a BTC string amount into satoshis
   *
   * @param {string} amount - Amount BTC string
   * @throws {TypeError} Invalid amount
   * @returns {Object} Amount represented in satoshis
   */
  _parseAmount(amount: string): any;

  /**
   * @function
   * @returns {Object} - A plain object with the URI properties
   */
  toObject(): any;

  /**
   * @function
   * @returns {Object} - A plain object with the URI properties
   */
  toJSON(): any;

  /**
   * Will return a string representation of the URI
   *
   * @returns {string} Bitcoin URI string
   */
  toString(): string;

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Bitcoin URI
   */
  inspect(): string;
}
