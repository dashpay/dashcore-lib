import { PrivateKey } from '../../PrivateKey';
import { Transaction } from '../Transaction';

/**
 * @typedef {Object} ProDisTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} actorIndex
 * @property {string[]} [payloadSigs]
 */
export type ProDisTransactionPayloadJSON = {
  version: number;
  proTxHash: string;
  actorIndex: number;
  payloadSigs?: string[];
};

/**
 * @class ProDisTxPayload
 * @property {number} version uint_16    2    ProDisTx version number. Currently set to 1.
 * @property {string} proTxHash uint256    32    The hash of the shared masternode's provider transaction
 * @property {number} actorIndex uint_16    2    Index of the share that performs the dissolution
 * @property {string[]} payloadSigs uint_8 + 65 * n    Compact ECDSA signatures of the sign hash
 */
export class ProDisTxPayload {
  constructor(payloadJSON?: ProDisTransactionPayloadJSON);

  /**
   * Parses raw ProDisTxPayload payload
   * @param {Buffer} rawPayload
   * @return {ProDisTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProDisTxPayload;

  /**
   * Creates new instance of ProDisTxPayload payload from JSON
   * @param {string|ProDisTransactionPayloadJSON} payloadJSON
   * @return {ProDisTxPayload}
   */
  static fromJSON(
    payloadJSON: string | ProDisTransactionPayloadJSON
  ): ProDisTxPayload;

  /**
   * Validates ProDisTxPayload payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes ProDisTxPayload payload to JSON
   * @param [options]
   * @param {boolean} options.skipSignature - skip signatures
   * @return {ProDisTransactionPayloadJSON}
   */
  toJSON(options?: { skipSignature?: boolean }): ProDisTransactionPayloadJSON;

  /**
   * Serializes ProDisTxPayload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - serialize with no signatures
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature?: boolean }): Buffer;

  /**
   * Hash that every dissolution signature commits to (CProDisTx::MakeSignHash)
   * @param {Transaction} transaction - the dissolution transaction
   * @param {number} sigCount - number of signatures the transaction will carry
   * @return {Buffer}
   */
  getSignHash(transaction: Transaction, sigCount: number): Buffer;

  /**
   * Signs the dissolution and appends the signature to payloadSigs
   * @param {string|PrivateKey} privateKey - share owner key
   * @param {Transaction} transaction - the dissolution transaction
   * @param {number} sigCount - number of signatures the transaction will carry
   * @return {ProDisTxPayload}
   */
  sign(
    privateKey: string | PrivateKey,
    transaction: Transaction,
    sigCount: number
  ): ProDisTxPayload;

  /**
   * Verifies one of the dissolution signatures against a share owner key id
   * @param {string|Buffer} publicKeyId - share owner key id
   * @param {Transaction} transaction - the dissolution transaction
   * @param {number} [sigIndex=0] - index of the signature in payloadSigs
   * @return {boolean}
   */
  verifySignature(
    publicKeyId: string | Buffer,
    transaction: Transaction,
    sigIndex?: number
  ): boolean;

  /**
   * Copy payload instance
   * @return {ProDisTxPayload}
   */
  copy(): ProDisTxPayload;

  /**
   * uint_16    2    ProDisTx version number. Currently set to 1.
   */
  version: number;
  /**
   * uint256    32    The hash of the shared masternode's provider transaction
   */
  proTxHash: string;
  /**
   * uint_16    2    Index of the share that performs the dissolution
   */
  actorIndex: number;
  /**
   * Compact ECDSA signatures: one by the actor (unilateral) or one per share in share order (unanimous)
   */
  payloadSigs: string[];
}
