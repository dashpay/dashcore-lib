import { Address } from '../Address';
import { Network } from '../Network';
import { PublicKey } from '../PublicKey';
import { Signature } from '../crypto/Signature';

/**
 * A Bitcoin transaction script. Each transaction's inputs and outputs
 * has a script that is evaluated to validate its spending.
 *
 * See https://en.bitcoin.it/wiki/Script
 *
 * @constructor
 * @param {Object|string|Buffer=} from optional data to populate script
 */
export class Script {
  constructor(from: any | string | Buffer);

  chunks: any[];

  /**
   * @returns {boolean} if this is a pay to pubkey hash output script
   */
  isPublicKeyHashOut(): boolean;

  /**
   * @returns {boolean} if this is a pay to public key hash input script
   */
  isPublicKeyHashIn(): boolean;

  /**
   * @returns {boolean} if this is a public key output script
   */
  isPublicKeyOut(): boolean;

  /**
   * @returns {boolean} if this is a pay to public key input script
   */
  isPublicKeyIn(): boolean;

  /**
   * @returns {boolean} if this is a p2sh output script
   */
  isScriptHashOut(): boolean;

  /**
   * @returns {boolean} if this is a p2sh input script
   * Note that these are frequently indistinguishable from pubkeyhashin
   */
  isScriptHashIn(): boolean;

  /**
   * @returns {boolean} if this is a mutlsig output script
   */
  isMultisigOut(): boolean;

  /**
   * @returns {boolean} if this is a multisig input script
   */
  isMultisigIn(): boolean;

  /**
   * @returns {boolean} true if this is a valid standard OP_RETURN output
   */
  isDataOut(): boolean;

  /**
   * Retrieve the associated data for this script.
   * In the case of a pay to public key hash or P2SH, return the hash.
   * In the case of a standard OP_RETURN, return the data
   * @returns {Buffer}
   */
  getData(): Buffer;

  /**
   * @returns {boolean} if the script is only composed of data pushing
   * opcodes or small int opcodes (OP_0, OP_1, ..., OP_16)
   */
  isPushOnly(): boolean;

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classify(): any;

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classifyOutput(): any;

  /**
   * @returns {object} The Script type if it is a known form,
   * or Script.UNKNOWN if it isn't
   */
  classifyInput(): any;

  /**
   * @returns {boolean} if script is one of the known types
   */
  isStandard(): boolean;

  /**
   * Adds a script element at the start of the script.
   * @param {*} obj a string, number, Opcode, Buffer, or object to add
   * @returns {Script} this script instance
   */
  prepend(obj: any): Script;

  /**
   * Compares a script with another script
   */
  equals(): void;

  /**
   * Adds a script element to the end of the script.
   *
   * @param {*} obj a string, number, Opcode, Buffer, or object to add
   * @returns {Script} this script instance
   *
   */
  add(obj: any): Script;

  /**
   * @returns {Script} a new Multisig output script for given public keys,
   * requiring m of those public keys to spend
   * @param {PublicKey[]} publicKeys - list of all public keys controlling the output
   * @param {number} threshold - amount of required signatures to spend the output
   * @param {Object=} opts - Several options:
   *        - noSorting: defaults to false, if true, don't sort the given
   *                      public keys before creating the script
   */
  static buildMultisigOut(
    publicKeys: PublicKey[],
    threshold: number,
    opts?: any
  ): Script;

  /**
   * A new Multisig input script for the given public keys, requiring m of those public keys to spend
   *
   * @param {PublicKey[]} pubkeys list of all public keys controlling the output
   * @param {number} threshold amount of required signatures to spend the output
   * @param {Array} signatures and array of signature buffers to append to the script
   * @param {Object=} opts
   * @param {boolean=} opts.noSorting don't sort the given public keys before creating the script (false by default)
   * @param {Script=} opts.cachedMultisig don't recalculate the redeemScript
   *
   * @returns {Script}
   */
  static buildMultisigIn(
    pubkeys: PublicKey[],
    threshold: number,
    signatures: any[],
    opts?: {
      noSorting?: boolean;
      cachedMultisig?: Script;
    }
  ): Script;

  /**
   * A new P2SH Multisig input script for the given public keys, requiring m of those public keys to spend
   *
   * @param {PublicKey[]} pubkeys list of all public keys controlling the output
   * @param {number} threshold amount of required signatures to spend the output
   * @param {Array} signatures and array of signature buffers to append to the script
   * @param {Object=} opts
   * @param {boolean=} opts.noSorting don't sort the given public keys before creating the script (false by default)
   * @param {Script=} opts.cachedMultisig don't recalculate the redeemScript
   *
   * @returns {Script}
   */
  static buildP2SHMultisigIn(
    pubkeys: PublicKey[],
    threshold: number,
    signatures: any[],
    opts?: {
      noSorting?: boolean;
      cachedMultisig?: Script;
    }
  ): Script;

  /**
   * @returns {Script} a new pay to public key hash output for the given
   * address or public key
   * @param {(Address|PublicKey)} to - destination address or public key
   */
  static buildPublicKeyHashOut(to: Address | PublicKey): Script;

  /**
   * @returns {Script} a new pay to public key output for the given
   *  public key
   */
  static buildPublicKeyOut(): Script;

  /**
   * @returns {Script} a new OP_RETURN script with data
   * @param {(string|Buffer)} data - the data to embed in the output
   * @param {(string)} encoding - the type of encoding of the string
   */
  static buildDataOut(data: string | Buffer, encoding: string): Script;

  /**
   * @param {Script|Address} script - the redeemScript for the new p2sh output.
   *    It can also be a p2sh address
   * @returns {Script} new pay to script hash script for given script
   */
  static buildScriptHashOut(script: Script | Address): Script;

  /**
   * Builds a scriptSig (a script for an input) that signs a public key output script.
   *
   * @param {Signature|Buffer} signature - a Signature object, or the signature in DER canonical encoding
   * @param {number=} sigtype - the type of the signature (defaults to SIGHASH_ALL)
   */
  static buildPublicKeyIn(
    signature: Signature | Buffer,
    sigtype?: number
  ): void;

  /**
   * Builds a scriptSig (a script for an input) that signs a public key hash
   * output script.
   *
   * @param {Buffer|string|PublicKey} publicKey
   * @param {Signature|Buffer} signature - a Signature object, or the signature in DER canonical encoding
   * @param {number=} sigtype - the type of the signature (defaults to SIGHASH_ALL)
   */
  static buildPublicKeyHashIn(
    publicKey: Buffer | string | PublicKey,
    signature: Signature | Buffer,
    sigtype?: number
  ): void;

  /**
   * @returns {Script} an empty script
   */
  static empty(): Script;

  /**
   * @returns {Script} a new pay to script hash script that pays to this script
   */
  toScriptHashOut(): Script;

  /**
   * @return {Script} an output script built from the address
   */
  static fromAddress(): Script;

  /**
   * Will return the associated address information object
   * @return {Address|boolean}
   */
  getAddressInfo(): Address | boolean;

  /**
   * @param {Network=} network
   * @return {Address|boolean} the associated address for this script if possible, or false
   */
  toAddress(network?: Network): Address | boolean;

  /**
   * Analogous to bitcoind's FindAndDelete. Find and delete equivalent chunks,
   * typically used with push data chunks.  Note that this will find and delete
   * not just the same data, but the same data with the same push data op as
   * produced by default. i.e., if a pushdata in a tx does not use the minimal
   * pushdata op, then when you try to remove the data it is pushing, it will not
   * be removed, because they do not use the same pushdata op.
   */
  findAndDelete(): void;

  /**
   * Comes from bitcoind's script interpreter CheckMinimalPush function
   * @returns {boolean} if the chunk {i} is the smallest way to push that particular data.
   */
  checkMinimalPush(): boolean;

  /**
   * Comes from bitcoind's script DecodeOP_N function
   * @param {number} opcode
   * @returns {number} numeric value in range of 0 to 16
   */
  _decodeOP_N(opcode: number): number;

  /**
   * Comes from bitcoind's script GetSigOpCount(boolean) function
   * @param {boolean} use current (true) or pre-version-0.6 (false) logic
   * @returns {number} number of signature operations required by this script
   */
  getSignatureOperationsCount(use: boolean): number;
}
