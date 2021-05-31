/**
 * @typedef {Object} TransitionPayloadJSON
 * @property {Number} version
 * @property {string} regTxId
 * @property {string} hashPrevSubTx
 * @property {Number} creditFee
 * @property {string} hashSTPacket
 * @property {string} [payloadSig]
 * @property {string} [payloadSigSize]
 */
export type TransitionPayloadJSON = {
  version: number;
  regTxId: string;
  hashPrevSubTx: string;
  creditFee: number;
  hashSTPacket: string;
  payloadSig?: string;
  payloadSigSize?: string;
};

/**
 * @class SubTxTransitionPayload
 * @property {number} version
 * @property {string} regTxId
 * @property {string} hashPrevSubTx
 * @property {number} creditFee
 * @property {string} hashSTPacket
 * @property {string} [payloadSig]
 * @property {string} [payloadSigSize]
 */
export class SubTxTransitionPayload {
  /**
   * Serialize transition payload
   * @param {TransitionPayloadJSON} transitionPayload
   * @return {Buffer} serialized payload
   */
  static serializeJSONToBuffer(
    transitionPayload: TransitionPayloadJSON
  ): Buffer;

  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {SubTxTransitionPayload}
   */
  static fromBuffer(rawPayload: Buffer): SubTxTransitionPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|TransitionPayloadJSON} payloadJson
   * @return {SubTxTransitionPayload}
   */
  static fromJSON(
    payloadJson: string | TransitionPayloadJSON
  ): SubTxTransitionPayload;

  /**
   * Validate payload
   * @param {TransitionPayloadJSON} blockchainUserPayload
   * @return {boolean}
   */
  static validatePayloadJSON(
    blockchainUserPayload: TransitionPayloadJSON
  ): boolean;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * @param {string} regTxId - Hex string
   */
  setRegTxId(regTxId: string): void;

  /**
   * @param {string} hashPrevSubTx - Hex string
   * @return {SubTxTransitionPayload}
   */
  setHashPrevSubTx(hashPrevSubTx: string): SubTxTransitionPayload;

  /**
   * @param {string} hashSTPacket - Hex string
   * @return {SubTxTransitionPayload}
   */
  setHashSTPacket(hashSTPacket: string): SubTxTransitionPayload;

  /**
   * @param {number} creditFee
   * @return {SubTxTransitionPayload}
   */
  setCreditFee(creditFee: number): SubTxTransitionPayload;

  /**
   * Serializes payload to JSON
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {TransitionPayloadJSON}
   */
  toJSON(options?: { skipSignature: boolean }): TransitionPayloadJSON;

  /**
   * Serialize payload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {SubTxTransitionPayload}
   */
  copy(): SubTxTransitionPayload;

  version: number;
  regTxId: string;
  hashPrevSubTx: string;
  creditFee: number;
  hashSTPacket: string;
  payloadSig?: string;
  payloadSigSize?: string;
}
