import PublicKey from '../../PublicKey';
import { Input } from './Input';
import { TransactionSignature } from '../TransactionSignature';
import { Transaction } from '../Transaction';

/**
 * @constructor
 */
export class MultiSigInput {
  constructor();

  /**
   *
   * @param {Buffer[]} signatures
   * @param {PublicKey[]} publicKeys
   * @param {Transaction} transaction
   * @param {number} inputIndex
   * @param {Input} input
   * @returns {TransactionSignature[]}
   */
  static normalizeSignatures(
    signatures: Buffer[],
    publicKeys: PublicKey[],
    transaction: Transaction,
    inputIndex: number,
    input: Input
  ): TransactionSignature[];
}
