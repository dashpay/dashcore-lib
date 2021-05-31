import { Script } from '../script/Script';
import { Address } from '../Address';
/**
 * Represents an unspent output information: its script, associated amount and address,
 * transaction id and output index.
 *
 * @constructor
 * @param {object} data
 * @param {string} data.txid the previous transaction id
 * @param {string=} data.txId alias for `txid`
 * @param {number} data.vout the index in the transaction
 * @param {number=} data.outputIndex alias for `vout`
 * @param {string|Script} data.scriptPubKey the script that must be resolved to release the funds
 * @param {string|Script=} data.script alias for `scriptPubKey`
 * @param {number} data.amount amount of bitcoins associated
 * @param {number=} data.satoshis alias for `amount`, but expressed in satoshis (1 BTC = 1e8 satoshis)
 * @param {string|Address=} data.address the associated address to the script, if provided
 */
export class UnspentOutput {
  constructor(data: {
    txid: string;
    txId?: string;
    vout: number;
    outputIndex?: number;
    scriptPubKey: string | Script;
    script: string | Script;
    amount: number;
    satoshis?: number;
    address: string | Address;
  });

  txId: string;
  address: Address;
  outputIndex: number;
  satoshis: number;
  script: Script;

  /**
   * Provide an informative output when displaying this object in the console
   *
   * @return {string}
   */
  inspect(): string;

  /**
   * String representation: just "txid:index"
   *
   * @return {string}
   */
  toString(): string;

  /**
   * Deserialize an UnspentOutput from an object
   *
   * @param {object|string} data
   * @returns {UnspentOutput}
   */
  static fromObject(data: any | string): UnspentOutput;

  /**
   * Returns a plain object (no prototype or methods) with the associated info for this output
   *
   * @function
   * @return {object}
   */
  toObject(): any;
}
