/**
 * @typedef {Object} ProUpRegTransactionPayloadJSON
 * @property {number} version
 * @property {string} proTxHash
 * @property {string} pubKeyOperator
 * @property {string} keyIDVoting
 * @property {string} payoutAddress
 * @property {string} inputsHash
 * @property {string} [payloadSig]
 */
export type ProUpRegTransactionPayloadJSON = {
  version: number;
  proTxHash: string;
  pubKeyOperator: string;
  keyIDVoting: string;
  payoutAddress: string;
  inputsHash: string;
  payloadSig?: string;
};

/**
 * @class ProUpRegTxPayload
 * @property {number} version uint_16    2    Upgrade Provider Transaction version number. Currently set to 1.
 * @property {string} proTxHash uint256    32    The hash of the provider transaction
 * @property {number} mode uint_16    2    Masternode mode
 * @property {string} pubKeyOperator BLSPubKey    48    The public key hash used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting CKeyID    20    The public key hash used for voting.
 * @property {number} scriptPayoutSize compactSize uint    1-9    Size of the Payee Script.
 * @property {string} scriptPayout Script    Variable    Payee script (p2pkh/p2sh)
 * @property {string} inputsHash uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {number} payloadSigSize compactSize uint    1-9    Size of the Signature
 * @property {string} payloadSig vector    Variable    Signature of the hash of the ProTx fields. Signed by the Owner.
 *
 * @param {ProUpRegTransactionPayloadJSON} [payloadJSON]
 * @constructor
 */
export class ProUpRegTxPayload {
  constructor(payloadJSON?: ProUpRegTransactionPayloadJSON);

  /**
   * Parses raw ProUpRegTxPayload payload
   * @param {Buffer} rawPayload
   * @return {ProUpRegTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProUpRegTxPayload;

  /**
   * Creates new instance of ProUpRegTxPayload payload from JSON
   * @param {string|ProUpRegTransactionPayloadJSON} payloadJSON
   * @return {ProUpRegTxPayload}
   */
  static fromJSON(
    payloadJSON: string | ProUpRegTransactionPayloadJSON
  ): ProUpRegTxPayload;

  /**
   * Validates ProUpRegTxPayload payload data
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes ProUpRegTxPayload payload to JSON
   * @param [options]
   * @param [options.skipSignature] - skip signature part. Needed for creating new signature
   * @param [options.network]
   * @return {ProUpRegTransactionPayloadJSON}
   */
  toJSON(options?: {
    skipSignature?: any;
    network?: any;
  }): ProUpRegTransactionPayloadJSON;

  /**
   * Serializes ProUpRegTxPayload to buffer
   * @param [options]
   * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * Copy payload instance
   * @return {ProUpRegTxPayload}
   */
  copy(): ProUpRegTxPayload;

  /**
   * uint_16    2    Upgrade Provider Transaction version number. Currently set to 1.
   */
  version: number;
  /**
   * uint256    32    The hash of the provider transaction
   */
  proTxHash: string;
  /**
   * uint_16    2    Masternode mode
   */
  mode: number;
  /**
   * BLSPubKey    48    The public key hash used for operational related signing (network messages, ProTx updates)
   */
  pubKeyOperator: string;
  /**
   * CKeyID    20    The public key hash used for voting.
   */
  keyIDVoting: string;
  /**
   * compactSize uint    1-9    Size of the Payee Script.
   */
  scriptPayoutSize: number;
  /**
   * Script    Variable    Payee script (p2pkh/p2sh)
   */
  scriptPayout: string;
  /**
   * uint256    32    Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * compactSize uint    1-9    Size of the Signature
   */
  payloadSigSize: number;
  /**
   * vector    Variable    Signature of the hash of the ProTx fields. Signed by the Owner.
   */
  payloadSig: string;
}
