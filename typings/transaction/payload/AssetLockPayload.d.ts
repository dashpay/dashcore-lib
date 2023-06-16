import { Output, OutputJSON } from '../Output';

/**
 * @typedef {Object} AssetLockPayloadJSON
 * @property {number} version
 * @property {OutputJSON[]} creditOutputs
 */
export type AssetLockPayloadJSON = {
  version: number;
  creditOutputs: OutputJSON[]
};

/**
 * @class AssetLockPayload
 * @property {number} version
 * @property {Output[]} creditOutputs
 */
export class AssetLockPayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {AssetLockPayload}
   */
  static fromBuffer(rawPayload: Buffer): AssetLockPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|AssetLockPayloadJSON} payloadJson
   * @return {AssetLockPayload}
   */
  static fromJSON(payloadJson: string | AssetLockPayloadJSON): AssetLockPayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @return {AssetLockPayloadJSON}
   */
  toJSON(): AssetLockPayloadJSON;

  /**
   * Serialize payload to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * Copy payload instance
   * @return {AssetLockPayload}
   */
  copy(): AssetLockPayload;

  version: number;
  creditOutputs: Output[]
}
