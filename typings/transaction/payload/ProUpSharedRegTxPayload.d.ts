import { PrivateKey } from '../../PrivateKey';

/**
 * @typedef {Object} ProUpSharedRegTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {string} pubKeyOperator
 * @property {string} keyIDVoting
 * @property {string} inputsHash
 * @property {string[]} [payloadSigs]
 */
export type ProUpSharedRegTransactionPayloadJSON = {
  version: number;
  proTxHash: string;
  pubKeyOperator: string;
  keyIDVoting: string;
  inputsHash: string;
  payloadSigs?: string[];
};

/**
 * @class ProUpSharedRegTxPayload
 * @property {number} version uint_16    2    ProUpSharedRegTx version number. Currently set to 1.
 * @property {string} proTxHash uint256    32    The hash of the shared masternode's provider transaction
 * @property {string} pubKeyOperator BLSPubKey    48    The new operator public key (basic BLS scheme)
 * @property {string} keyIDVoting CKeyID    20    The new public key hash used for voting
 * @property {string} inputsHash uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {string[]} payloadSigs uint_8 + 65 * n    Compact ECDSA signatures of the payload hash, one per share in share order
 */
export class ProUpSharedRegTxPayload {
  constructor(payloadJSON?: ProUpSharedRegTransactionPayloadJSON);

  /**
   * Parses raw ProUpSharedRegTxPayload payload
   * @param {Buffer} rawPayload
   * @return {ProUpSharedRegTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProUpSharedRegTxPayload;

  /**
   * Creates new instance of ProUpSharedRegTxPayload payload from JSON
   * @param {string|ProUpSharedRegTransactionPayloadJSON} payloadJSON
   * @return {ProUpSharedRegTxPayload}
   */
  static fromJSON(
    payloadJSON: string | ProUpSharedRegTransactionPayloadJSON
  ): ProUpSharedRegTxPayload;

  /**
   * Validates ProUpSharedRegTxPayload payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes ProUpSharedRegTxPayload payload to JSON
   * @param [options]
   * @param {boolean} options.skipSignature - skip signatures. Needed for creating new signatures
   * @return {ProUpSharedRegTransactionPayloadJSON}
   */
  toJSON(options?: {
    skipSignature?: boolean;
  }): ProUpSharedRegTransactionPayloadJSON;

  /**
   * Serializes ProUpSharedRegTxPayload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - omit the signatures, as Core does when hashing the payload for signing
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature?: boolean }): Buffer;

  /**
   * Signs the payload hash and appends the signature to payloadSigs
   * @param {string|PrivateKey} privateKey - share owner key
   * @return {ProUpSharedRegTxPayload}
   */
  sign(privateKey: string | PrivateKey): ProUpSharedRegTxPayload;

  /**
   * Verifies one of the payload signatures against a share owner key id
   * Only canonical signatures (recovery header 27..34, low S) verify.
   * @param {string|Buffer} publicKeyId - share owner key id
   * @param {number} [sigIndex=0] - index of the signature in payloadSigs
   * @return {boolean}
   */
  verifySignature(publicKeyId: string | Buffer, sigIndex?: number): boolean;

  /**
   * Hash of the payload; with skipSignature it is the hash every share owner signs
   * @param [options]
   * @param {boolean} options.skipSignature - omit the signatures
   * @return {Buffer}
   */
  getHash(options?: { skipSignature?: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {ProUpSharedRegTxPayload}
   */
  copy(): ProUpSharedRegTxPayload;

  /**
   * uint_16    2    ProUpSharedRegTx version number. Currently set to 1.
   */
  version: number;
  /**
   * uint256    32    The hash of the shared masternode's provider transaction
   */
  proTxHash: string;
  /**
   * BLSPubKey    48    The new operator public key (basic BLS scheme)
   */
  pubKeyOperator: string;
  /**
   * CKeyID    20    The new public key hash used for voting
   */
  keyIDVoting: string;
  /**
   * uint256    32    Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * Compact ECDSA signatures of the payload hash, one per share in share order
   */
  payloadSigs: string[];
}
