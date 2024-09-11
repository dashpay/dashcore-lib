/**
 * @typedef {Object} MnHfSignalSignalJSON
 * @property {number} versionBit - The version bit associated with the hard fork.
 * @property {string} quorumHash - Hash of the quorum signing this message.
 * @property {string} sig - BLS signature on the version bit by the public key associated with the quorum.
 */
export type MnHfSignalSignalJSON = {
  versionBit: number;
  quorumHash: string;
  sig: string;
};

/**
 * @typedef {Object} MnHfSignalPayloadJSON
 * @property {number} version - The version number of the transaction.
 * @property {MnHfSignalSignalJSON} signal - Signal data containing version bit, quorum hash, and signature.
 */
export type MnHfSignalPayloadJSON = {
  version: number;
  signal: MnHfSignalSignalJSON;
};

/**
 * @class MnHfSignalPayload
 * @property {number} version - The version number of the transaction.
 * @property {MnHfSignalSignal} signal - Signal data containing version bit, quorum hash, and signature.
 */
export class MnHfSignalPayload {
  /**
   * Parse raw payload buffer.
   * @param {Buffer} rawPayload - The raw payload buffer.
   * @return {MnHfSignalPayload} - Parsed MnHfSignalPayload instance.
   */
  static fromBuffer(rawPayload: Buffer): MnHfSignalPayload;

  /**
   * Create a new instance of the payload from JSON.
   * @param {string | MnHfSignalPayloadJSON} payloadJson - The JSON object or string representing the payload.
   * @return {MnHfSignalPayload} - Parsed MnHfSignalPayload instance.
   */
  static fromJSON(payloadJson: string | MnHfSignalPayloadJSON): MnHfSignalPayload;

  /**
   * Validates the payload data.
   * @return {boolean} - Whether the payload is valid.
   */
  validate(): boolean;

  /**
   * Serializes the payload to JSON.
   * @return {MnHfSignalPayloadJSON} - Serialized JSON representation of the payload.
   */
  toJSON(): MnHfSignalPayloadJSON;

  /**
   * Serializes the payload to a buffer.
   * @return {Buffer} - The buffer representation of the payload.
   */
  toBuffer(): Buffer;

  /**
   * Create a copy of the payload instance.
   * @return {MnHfSignalPayload} - A new copy of the payload.
   */
  copy(): MnHfSignalPayload;

  version: number;
  signal: {
    versionBit: number;
    quorumHash: string;
    sig: string;
  };
}
