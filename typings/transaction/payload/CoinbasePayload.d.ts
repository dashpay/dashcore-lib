/**
 * @typedef {Object} CoinbasePayloadJSON
 * @property {number} version
 * @property {number} height
 * @property {string} merkleRootMNList
 * @property {string} merkleRootQuorums
 */
export type CoinbasePayloadJSON = {
  version: number;
  height: number;
  merkleRootMNList: string;
  merkleRootQuorums: string;
};

/**
 * @class CoinbasePayload
 * @property {number} version
 * @property {number} height
 * @property {string} merkleRootMNList
 * @property {string} merkleRootQuorums
 */
export class CoinbasePayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {CoinbasePayload}
   */
  static fromBuffer(rawPayload: Buffer): CoinbasePayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|CoinbasePayloadJSON} payloadJson
   * @return {CoinbasePayload}
   */
  static fromJSON(payloadJson: string | CoinbasePayloadJSON): CoinbasePayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @return {CoinbasePayloadJSON}
   */
  toJSON(): CoinbasePayloadJSON;

  /**
   * Serialize payload to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * Copy payload instance
   * @return {CoinbasePayload}
   */
  copy(): CoinbasePayload;

  version: number;
  height: number;
  merkleRootMNList: string;
  merkleRootQuorums: string;
}
