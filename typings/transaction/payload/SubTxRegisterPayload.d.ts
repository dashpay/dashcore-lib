import { PrivateKey } from '../../PrivateKey';

/**
 * @typedef {Object} BlockchainUserPayloadJSON
 * @property {number} version - payload version
 * @property {Buffer} pubKeyId
 * @property {string} userName
 * @property {string} [payloadSig]
 * @property {string} [payloadSigSize]
 */
export type BlockchainUserPayloadJSON = {
  version: number;
  pubKeyId: Buffer;
  userName: string;
  payloadSig?: string;
  payloadSigSize?: string;
};

/**
 * @class SubTxRegisterPayload
 * @property {number} version - payload version
 * @property {Buffer} pubKeyId
 * @property {string} userName
 * @property {string} [payloadSig]
 * @property {string} [payloadSigSize]
 */
export class SubTxRegisterPayload {
  /**
   * Serialize blockchain user payload
   * @param {BlockchainUserPayloadJSON} blockchainUserPayload
   * @return {Buffer} serialized payload
   */
  static serializeJSONToBuffer(
    blockchainUserPayload: BlockchainUserPayloadJSON
  ): Buffer;

  /**
   * Parse raw blockchain user payload
   * @param {Buffer} rawPayload
   * @return {SubTxRegisterPayload}
   */
  static fromBuffer(rawPayload: Buffer): SubTxRegisterPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|BlockchainUserPayloadJSON} payloadJson
   * @return {SubTxRegisterPayload}
   */
  static fromJSON(
    payloadJson: string | BlockchainUserPayloadJSON
  ): SubTxRegisterPayload;

  /**
   * Validate payload
   * @param {BlockchainUserPayloadJSON} blockchainUserPayload
   * @return {boolean}
   */
  static validatePayloadJSON(
    blockchainUserPayload: BlockchainUserPayloadJSON
  ): boolean;

  /**
   * @param {string} userName
   * @return {SubTxRegisterPayload}
   */
  setUserName(userName: string): SubTxRegisterPayload;

  /**
   * @param {Buffer} pubKeyId
   * @return {SubTxRegisterPayload}
   */
  setPubKeyId(pubKeyId: Buffer): SubTxRegisterPayload;

  /**
   * Extracts and sets pubKeyId from private key
   * @param {string|PrivateKey} privateKey
   * @return {SubTxRegisterPayload}
   */
  setPubKeyIdFromPrivateKey(
    privateKey: string | PrivateKey
  ): SubTxRegisterPayload;

  /**
   * Serializes payload to JSON
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {BlockchainUserPayloadJSON}
   */
  toJSON(options?: { skipSignature: boolean }): BlockchainUserPayloadJSON;

  /**
   * Serialize payload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * payload version
   */
  version: number;
  pubKeyId: Buffer;
  userName: string;
  payloadSig?: string;
  payloadSigSize?: string;
}
