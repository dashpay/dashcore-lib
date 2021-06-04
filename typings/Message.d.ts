import { PrivateKey } from './PrivateKey';
import { Address } from './Address';
/**
 * constructs a new message to sign and verify.
 * @constructor
 * @param {String} message
 * @returns {Message}
 */
export class Message {
  constructor(message: string);

  message: string;

  static MAGIC_BYTES: Buffer;

  /**
   * Return a Buffer hash prefixed with MAGIC_BYTES
   * @return {Buffer}
   */
  magicHash(): Buffer;

  /**
   * Will sign a message with a given Bitcoin private key.
   *
   * @param {PrivateKey} privateKey - An instance of PrivateKey
   * @returns {String} A base64 encoded compact signature
   */
  sign(privateKey: PrivateKey): string;

  /**
   * Will return a boolean of the signature is valid for a given bitcoin address.
   * If it isn't the specific reason is accessible via the "error" member.
   *
   * @param {Address|String} bitcoinAddress - A bitcoin address
   * @param {String} signatureString - A base64 encoded compact signature
   * @returns {Boolean}
   */
  verify(bitcoinAddress: Address | string, signatureString: string): boolean;

  /**
   * Instantiate a message from a message string
   *
   * @param {String} str - A string of the message
   * @returns {Message} A new instance of a Message
   */
  static fromString(str: string): Message;

  /**
   * Instantiate a message from JSON
   *
   * @param {String} json - An JSON string or Object with keys: message
   * @returns {Message} A new instance of a Message
   */
  static fromJSON(json: string): Message;

  /**
   * @returns {Object} A plain object with the message information
   */
  toObject(): any;

  /**
   * @returns {String} A JSON representation of the message information
   */
  toJSON(): string;

  /**
   * Will return a the string representation of the message
   *
   * @returns {String} Message
   */
  toString(): string;

  /**
   * Will return a string formatted for the console
   *
   * @returns {String} Message
   */
  inspect(): string;
}
