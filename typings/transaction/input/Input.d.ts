import { Transaction } from '../Transaction';
import { PrivateKey } from '../../PrivateKey';
import { Script } from '../../script/Script';
import { BufferWriter } from '../../buffer/BufferWriter';

/**
 * Instantiate an Input from an Object
 *
 * @param params
 * @returns {Input|*}
 * @constructor
 */
export class Input {
  constructor(params: any);

  prevTxId: Buffer;
  outputIndex: number;
  sequenceNumber: number;
  script: Script;

  /**
   * @function
   * @returns {Object} A plain object with the input information
   */
  toObject(): Object;

  /**
   * @function
   * @returns {Object} A plain object with the input information
   */
  toJSON(): Object;

  /**
   * Instantiate an Input from an Object
   *
   * @param {Object} obj - An Object containing satoshis and script
   * @returns {Input} A instance of an Input
   */
  static fromObject(obj: Object): Input;
  /**
   * Set a script from a Buffer
   * Replace any previously set script
   *
   * @param {Buffer} br
   * @return {Input}
   */
  fromBufferReader(br: Buffer): Input;

  /**
   * Will return a BufferWriter instance with Input representation as value
   * @params {BufferWriter} writer?
   * @returns {BufferWriter} writer
   */
  toBufferWriter(write: BufferWriter): BufferWriter;
  /**
   * Set script from a Script, a buffer or it's String representation.
   * Replace any previously set script
   *
   * @param {Script|Buffer|String} script
   * @return {Input}
   */
  setScript(script: Script | Buffer | String): Input;
  /**
   * Retrieve signatures for the provided PrivateKey.
   *
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey} privateKey - the private key to use when signing
   * @param {number} inputIndex - the index of this input in the provided transaction
   * @param {number} sigType - defaults to Signature.SIGHASH_ALL
   * @param {Buffer} addressHash - if provided, don't calculate the hash of the
   *     public key associated with the private key provided
   * @abstract
   */
  getSignatures(
    transaction: Transaction,
    privateKey: PrivateKey,
    inputIndex: number,
    sigType: number,
    addressHash: Buffer
  ): void;

  /**
   * Answer if the input is final based on it's sequence number
   * @return {boolean}
   */
  isFinal(): Boolean;

  /**
   * Verifies the signature and returns if it's valid or not
   *
   * @param {Transaction} transaction
   * @param {Object} signature
   * @return {boolean}
   */
  isValidSignature(transaction: Transaction, signature: Object): Boolean;

  /**
   * @returns {Boolean} true if this is a coinbase input (represents no input)
   */
  isNull(): Boolean;
}
