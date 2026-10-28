/**
 * @typedef {Object} ProUpShareTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} shareIndex
 * @property {string} rewardAddress
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 */
export type ProUpShareTransactionPayloadJSON = {
  version: number;
  proTxHash: string;
  shareIndex: number;
  rewardAddress: string;
  inputsHash: string;
  payloadSig?: string;
};

/**
 * @class ProUpShareTxPayload
 * @property {number} version uint_16    2    ProUpShareTx version number. Currently set to 1.
 * @property {string} proTxHash uint256    32    The hash of the shared masternode's provider transaction
 * @property {number} shareIndex uint_16    2    Index of the share whose reward script is updated
 * @property {string} scriptReward Script    Variable    New reward script of the share (p2pkh/p2sh)
 * @property {string} inputsHash uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {string} [payloadSig] vector    Variable    Compact ECDSA signature of the payload hash. Signed by the share owner.
 */
export class ProUpShareTxPayload {
  constructor(payloadJSON?: ProUpShareTransactionPayloadJSON);

  /**
   * Parses raw ProUpShareTxPayload payload
   * @param {Buffer} rawPayload
   * @return {ProUpShareTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProUpShareTxPayload;

  /**
   * Creates new instance of ProUpShareTxPayload payload from JSON
   * @param {string|ProUpShareTransactionPayloadJSON} payloadJSON
   * @return {ProUpShareTxPayload}
   */
  static fromJSON(
    payloadJSON: string | ProUpShareTransactionPayloadJSON
  ): ProUpShareTxPayload;

  /**
   * Validates ProUpShareTxPayload payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes ProUpShareTxPayload payload to JSON
   * @param [options]
   * @param [options.skipSignature] - skip signature part. Needed for creating new signature
   * @param [options.network]
   * @return {ProUpShareTransactionPayloadJSON}
   */
  toJSON(options?: {
    skipSignature?: boolean;
    network?: any;
  }): ProUpShareTransactionPayloadJSON;

  /**
   * Serializes ProUpShareTxPayload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - omit the signature, as Core does when hashing the payload for signing
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature?: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {ProUpShareTxPayload}
   */
  copy(): ProUpShareTxPayload;

  /**
   * uint_16    2    ProUpShareTx version number. Currently set to 1.
   */
  version: number;
  /**
   * uint256    32    The hash of the shared masternode's provider transaction
   */
  proTxHash: string;
  /**
   * uint_16    2    Index of the share whose reward script is updated
   */
  shareIndex: number;
  /**
   * Script    Variable    New reward script of the share (p2pkh/p2sh)
   */
  scriptReward: string;
  /**
   * uint256    32    Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * vector    Variable    Compact ECDSA signature of the payload hash. Signed by the share owner.
   */
  payloadSig?: string;
}
