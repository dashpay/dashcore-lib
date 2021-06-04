/**
 * @typedef {Object} SubTxResetKeyPayloadJSON
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} newPubKeySize - length of the new public key (not present in implementation)
 * @property {Buffer} newPubKey
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - signature of most recent pubkey
 */
export type SubTxResetKeyPayloadJSON = {
  version: number;
  regTxHash: string;
  hashPrevSubTx: string;
  creditFee: number;
  newPubKeySize: number;
  newPubKey: Buffer;
  payloadSigSize: number;
  payloadSig: string;
};

/**
 * @class SubTxResetKeyPayload
 * @property {number} version - payload version
 * @property {string} regTxHash
 * @property {string} hashPrevSubTx
 * @property {number} creditFee - fee to pay for transaction (duffs)
 * @property {number} newPubKeySize - length of the new public key (not present in implementation)
 * @property {Buffer} newPubKey
 * @property {number} payloadSigSize - length of the signature (payloadSig)
 * @property {string} payloadSig - signature of most recent pubkey
 */
export class SubTxResetKeyPayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {SubTxResetKeyPayload}
   */
  static fromBuffer(rawPayload: Buffer): SubTxResetKeyPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|SubTxResetKeyPayloadJSON} payloadJson
   * @return {SubTxResetKeyPayload}
   */
  static fromJSON(
    payloadJson: string | SubTxResetKeyPayloadJSON
  ): SubTxResetKeyPayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * @param {string} regTxHash
   * @return {SubTxResetKeyPayload}
   */
  setRegTxHash(regTxHash: string): SubTxResetKeyPayload;

  /**
   * @param {string} hashPrevSubTx
   * @return {SubTxResetKeyPayload}
   */
  setPrevSubTxHash(hashPrevSubTx: string): SubTxResetKeyPayload;

  /**
   * @param {number} duffs
   * @return {SubTxResetKeyPayload}
   */
  setCreditFee(duffs: number): SubTxResetKeyPayload;

  /**
   * @param {Buffer} pubKeyId
   * @return {SubTxResetKeyPayload}
   */
  setNewPubKeyId(pubKeyId: Buffer): SubTxResetKeyPayload;

  /**
   * Extracts and sets pubKeyId from private key
   * @param {string|PrivateKey} privateKey
   * @return {SubTxResetKeyPayload}
   */
  setPubKeyIdFromPrivateKey(
    privateKey: string | PrivateKey
  ): SubTxResetKeyPayload;

  /**
   * Serializes payload to JSON
   * @return {{version: *, regTxHash: *, hashPrevSubTx: *, creditFee: *, newPubKeySize: *, newPubKey: *, payloadSigSize: *, payloadSig: *}}
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
   * length of the new public key (not present in implementation)
   */
  newPubKeySize: number;
  newPubKey: Buffer;
  /**
   * length of the signature (payloadSig)
   */
  payloadSigSize: number;
  /**
   * signature of most recent pubkey
   */
  payloadSig: string;
}
