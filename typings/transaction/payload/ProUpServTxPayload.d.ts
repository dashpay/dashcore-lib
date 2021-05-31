/**
 * @typedef {Object} ProUpServTxPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {string} service - Service string, ip and port
 * @property {string} [operatorPayoutAddress]
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 */
export type ProUpServTxPayloadJSON = {
  version: number;
  proTxHash: string;
  service: string;
  operatorPayoutAddress?: string;
  inputsHash: string;
  payloadSig?: string;
};

/**
 * @class ProUpServTxPayload
 * @property {number} version ProUpServTx version number. Currently set to 1.
 * @property {string} proTXHash The hash of the initial ProRegTx
 * @property {string} service string - ip and port
 * @property {string} inputsHash Hash of all the outpoints of the transaction inputs
 * @property {string} [scriptOperatorPayout] Payee script (p2pkh/p2sh)
 * @property {string} [payloadSig] BLSSig Signature of the hash of the ProUpServTx fields. Signed by the Operator.
 */
export class ProUpServTxPayload {
  /**
   * Parse raw transition payload
   * @param {Buffer} rawPayload
   * @return {ProUpServTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProUpServTxPayload;

  /**
   * Create new instance of payload from JSON
   * @param {ProUpServTxPayloadJSON} payloadJson
   * @return {ProUpServTxPayload}
   */
  static fromJSON(payloadJson: ProUpServTxPayloadJSON): ProUpServTxPayload;

  /**
   * Validates payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @param [options]
   * @param [options.skipSignature]
   * @param [options.network] - network param for payout address serialization
   * @return {ProUpServTxPayloadJSON}
   */
  toJSON(options?: {
    skipSignature?: any;
    network?: any;
  }): ProUpServTxPayloadJSON;

  /**
   * Serialize payload to buffer
   * @param [options]
   * @param {Boolean} options.skipSignature - skip signature. Used for generating new signature
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {ProUpServTxPayload}
   */
  copy(): ProUpServTxPayload;

  /**
   * ProUpServTx version number. Currently set to 1.
   */
  version: number;
  /**
   * The hash of the initial ProRegTx
   */
  proTXHash: string;
  /**
   * string - ip and port
   */
  service: string;
  /**
   * Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * Payee script (p2pkh/p2sh)
   */
  scriptOperatorPayout?: string;
  /**
   * BLSSig Signature of the hash of the ProUpServTx fields. Signed by the Operator.
   */
  payloadSig?: string;
}
