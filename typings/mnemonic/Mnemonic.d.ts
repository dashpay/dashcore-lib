import { HDPrivateKey } from '../HDPrivateKey';
import { Network } from '../Network';

/**
 * This is an immutable class that represents a BIP39 Mnemonic code.
 * See BIP39 specification for more info: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * A Mnemonic code is a a group of easy to remember words used for the generation
 * of deterministic wallets. A Mnemonic can be used to generate a seed using
 * an optional passphrase, for later generate a HDPrivateKey.
 *
 * @example
 * // generate a random mnemonic
 * var mnemonic = new Mnemonic();
 * var phrase = mnemonic.phrase;
 *
 * // use a different language
 * var mnemonic = new Mnemonic(Mnemonic.Words.SPANISH);
 * var xprivkey = mnemonic.toHDPrivateKey();
 *
 * @param {*=} data - a seed, phrase, or entropy to initialize (can be skipped)
 * @param {Array=} wordlist - the wordlist to generate mnemonics from
 * @returns {Mnemonic} A new instance of Mnemonic
 * @constructor
 */
export class Mnemonic {
  constructor(data?: any, wordlist?: any[]);

  phrase: string;
  /**
   * Will return a boolean if the mnemonic is valid
   *
   * @example
   *
   * var valid = Mnemonic.isValid('lab rescue lunch elbow recall phrase perfect donkey biology guess moment husband');
   * // true
   *
   * @param {String} mnemonic - The mnemonic string
   * @param {String} [wordlist] - The wordlist used
   * @returns {boolean}
   */
  static isValid(mnemonic: string, wordlist?: string): boolean;

  /**
   * Internal function to check if a mnemonic belongs to a wordlist.
   *
   * @param {String} mnemonic - The mnemonic string
   * @param {String} wordlist - The wordlist
   * @returns {boolean}
   */
  static _belongsToWordlist(mnemonic: string, wordlist: string): boolean;

  /**
   * Internal function to detect the wordlist used to generate the mnemonic.
   *
   * @param {String} mnemonic - The mnemonic string
   * @returns {Array} the wordlist or null
   */
  static _getDictionary(mnemonic: string): any[];

  /**
   * Will generate a seed based on the mnemonic and optional passphrase.
   *
   * @param {String} [passphrase]
   * @returns {Buffer}
   */
  toSeed(passphrase?: string): Buffer;

  /**
   * Will generate a Mnemonic object based on a seed.
   *
   * @param {Buffer} [seed]
   * @param {string} [wordlist]
   * @returns {Mnemonic}
   */
  static fromSeed(seed?: Buffer, wordlist?: string): Mnemonic;

  /**
   *
   * Generates a HD Private Key from a Mnemonic.
   * Optionally receive a passphrase and bitcoin network.
   *
   * @param {String=} [passphrase]
   * @param {Network|String|number=} [network] - The network: 'livenet' or 'testnet'
   * @returns {HDPrivateKey}
   */
  toHDPrivateKey(
    passphrase?: string,
    network?: Network | string | number
  ): HDPrivateKey;

  /**
   * Will return a the string representation of the mnemonic
   *
   * @returns {String} Mnemonic
   */
  toString(): string;

  /**
   * Will return a string formatted for the console
   *
   * @returns {String} Mnemonic
   */
  inspect(): string;

  /**
   * Internal function to generate a random mnemonic
   *
   * @param {Number} ENT - Entropy size, defaults to 128
   * @param {Array} wordlist - Array of words to generate the mnemonic
   * @returns {String} Mnemonic string
   */
  static _mnemonic(ENT: number, wordlist: any[]): string;

  /**
   * Internal function to generate mnemonic based on entropy
   *
   * @param {Number} entropy - Entropy buffer
   * @param {Array} wordlist - Array of words to generate the mnemonic
   * @returns {String} Mnemonic string
   */
  static _entropy2mnemonic(entropy: number, wordlist: any[]): string;
}
