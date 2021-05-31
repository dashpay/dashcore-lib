/**
 * @typedef {Object} ProUpRevTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {number} reason
 * @property {string} inputsHash
 * @property {string} payloadSig
 */
export type ProUpRevTransactionPayloadJSON = {
  version: number;
  proTxHash: string;
  reason: number;
  inputsHash: string;
  payloadSig: string;
};

/**
 * @class ProUpRevTxPayload
 * @property {number} version uint_16    2    ProUpRevTx version number. Currently set to 1.
 * @property {string} proTxHash uint256    32    The hash of the provider transaction
 * @property {number} reason uint_16    2    The reason for revoking the key.
 * @property {string} inputsHash uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {string} payloadSig BLSSig Signature of the hash of the ProTx fields. Signed by the Operator.
 */
export class ProUpRevTxPayload {
  /**
   * Serializes ProUpRevTxPayload payload
   * @param {ProUpRevTransactionPayloadJSON} transitionPayloadJSON
   * @return {Buffer} serialized payload
   */
  static serializeJSONToBuffer(
    transitionPayloadJSON: ProUpRevTransactionPayloadJSON
  ): Buffer;

  /**
   * Parses raw ProUpRevTxPayload payload
   * @param {Buffer} rawPayloadBuffer
   * @return {ProUpRevTxPayload}
   */
  static fromBuffer(rawPayloadBuffer: Buffer): ProUpRevTxPayload;

  /**
   * Creates new instance of ProUpRevTxPayload payload from JSON
   * @param {string|ProUpRevTransactionPayloadJSON} payloadJSON
   * @return {ProUpRevTxPayload}
   */
  static fromJSON(
    payloadJSON: string | ProUpRevTransactionPayloadJSON
  ): ProUpRevTxPayload;

  /**
   * Validates ProUpRevTxPayload payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes ProUpRevTxPayload payload to JSON
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {ProUpRevTransactionPayloadJSON}
   */
  toJSON(options?: { skipSignature: boolean }): ProUpRevTransactionPayloadJSON;

  /**
   * Serializes ProUpRevTxPayload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {ProUpRevTxPayload}
   */
  copy(): ProUpRevTxPayload;

  /**
   * uint_16    2    ProUpRevTx version number. Currently set to 1.
   */
  version: number;
  /**
   * uint256    32    The hash of the provider transaction
   */
  proTxHash: string;
  /**
   * uint_16    2    The reason for revoking the key.
   */
  reason: number;
  /**
   * uint256    32    Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * BLSSig Signature of the hash of the ProTx fields. Signed by the Operator.
   */
  payloadSig: string;
}
