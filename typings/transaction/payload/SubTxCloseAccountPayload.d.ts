/**
 * @typedef {Object} SubTxCloseAccountPayloadJSON
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - Signature from either the current key or a previous key (<= ~90 days old)
 */
export type SubTxCloseAccountPayloadJSON = {
  version: number;
  regTxHash: string;
  hashPrevSubTx: string;
  creditFee: number;
  payloadSigSize: number;
  payloadSig: string;
};

/**
 * @class SubTxCloseAccountPayload
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - Signature from either the current key or a previous key (<= ~90 days old)
 */
export class SubTxCloseAccountPayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {SubTxCloseAccountPayload}
   */
  static fromBuffer(rawPayload: Buffer): SubTxCloseAccountPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|SubTxCloseAccountPayloadJSON} payloadJson
   * @return {SubTxCloseAccountPayload}
   */
  static fromJSON(
    payloadJson: string | SubTxCloseAccountPayloadJSON
  ): SubTxCloseAccountPayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * @param {string} regTxHash
   * @return {SubTxCloseAccountPayload}
   */
  setRegTxHash(regTxHash: string): SubTxCloseAccountPayload;

  /**
   * @param {string} hashPrevSubTx
   * @return {SubTxCloseAccountPayload}
   */
  setPrevSubTxHash(hashPrevSubTx: string): SubTxCloseAccountPayload;

  /**
   * @param {number} duffs
   * @return {SubTxCloseAccountPayload}
   */
  setCreditFee(duffs: number): SubTxCloseAccountPayload;

  /**
   * Serializes payload to JSON
   * @return {{version: *, regTxHash: *, hashPrevSubTx: *, creditFee: *, payloadSigSize: *, payloadSig: *}}
   */
  toJSON(): any;

  /**
   * Serialize payload to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * payload version
   */
  version: number;
  regTxHash: string;
  hashPrevSubTx: string;
  /**
   * fee to pay for transaction (duffs)
   */
  creditFee: number;
  /**
   * length of the signature (payloadSig)
   */
  payloadSigSize: number;
  /**
   * Signature from either the current key or a previous key (<= ~90 days old)
   */
  payloadSig: string;
}
