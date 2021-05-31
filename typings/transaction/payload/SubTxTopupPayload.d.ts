/**
 * @typedef {Object} SubTxTopupPayloadJSON
 * @property {number} version
 * @property {string} regTxHash
 */
export type SubTxTopupPayloadJSON = {
  version: number;
  regTxHash: string;
};

/**
 * @class SubTxTopupPayload
 * @property {number} version
 * @property {string} regTxHash
 */
export class SubTxTopupPayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {SubTxTopupPayload}
   */
  static fromBuffer(rawPayload: Buffer): SubTxTopupPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|SubTxTopupPayloadJSON} payloadJson
   * @return {SubTxTopupPayload}
   */
  static fromJSON(
    payloadJson: string | SubTxTopupPayloadJSON
  ): SubTxTopupPayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @return {SubTxTopupPayload}
   */
  toJSON(): SubTxTopupPayload;

  /**
   * Serialize payload to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * Copy payload instance
   * @return {SubTxTopupPayload}
   */
  copy(): SubTxTopupPayload;

  /**
   * @param {string} regTxHash
   * @return {SubTxTopupPayload}
   */
  setRegTxHash(regTxHash: string): SubTxTopupPayload;

  version: number;
  regTxHash: string;
}
