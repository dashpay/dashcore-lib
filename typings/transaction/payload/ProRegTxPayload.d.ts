/**
 * @typedef {Object} ProRegTxPayloadJSON
 * @property {number} version    uint_16    2    Provider transaction version number. Currently set to 1.
 * @property {string} collateralHash
 * @property {number} collateralIndex    uint_32    4    The collateral index.
 * @property {string} service - service address, ip and port
 * @property {string} keyIDOwner    CKeyID    20    The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} pubKeyOperator    BLSPubKey    48    The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting    CKeyID    20    The public key hash used for voting.
 * @property {number} operatorReward    uint_16    2    A value from 0 to 10000.
 * @property {string} payoutAddress
 * @property {string} inputsHash    uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with keyIDOwner
 */
export type ProRegTxPayloadJSON = {
  version: number;
  collateralHash: string;
  collateralIndex: number;
  service: string;
  keyIDOwner: string;
  pubKeyOperator: string;
  keyIDVoting: string;
  operatorReward: number;
  payoutAddress: string;
  inputsHash: string;
  payloadSigSize?: number;
  payloadSig?: string;
};

/**
 * @class ProRegTxPayload
 * @property {number} version    uint_16    2    Provider transaction version number. Currently set to 1.
 * @property {number} type
 * @property {number} mode
 * @property {string} collateralHash
 * @property {number} collateralIndex    uint_32    4    The collateral index.
 * @property {string} service - service address, ip and port
 * @property {string} keyIDOwner    CKeyID    20    The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} pubKeyOperator    BLSPubKey    48    The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting    CKeyID    20    The public key hash used for voting.
 * @property {number} operatorReward    uint_16    2    A value from 0 to 10000.
 * @property {string} scriptPayout    Script    Variable    Payee script (p2pkh/p2sh)
 * @property {string} inputsHash    uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with keyIDOwner
 */
export class ProRegTxPayload {
  /**
   * Parse raw payload
   * @param {Buffer} rawPayload
   * @return {ProRegTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): ProRegTxPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|ProRegTxPayloadJSON} payloadJson
   * @return {ProRegTxPayload}
   */
  static fromJSON(payloadJson: string | ProRegTxPayloadJSON): ProRegTxPayload;

  /**
   * Validate payload
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @param [options]
   * @param [options.skipSignature]
   * @param [options.network] - network for address serialization
   * @return {ProRegTxPayloadJSON}
   */
  toJSON(options?: { skipSignature?: any; network?: any }): ProRegTxPayloadJSON;

  /**
   * Serialize payload to buffer
   * @param [options]
   * @param {Boolean} [options.skipSignature] - skip signature. Needed for signing
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature?: boolean }): Buffer;

  /**
   * uint_16    2    Provider transaction version number. Currently set to 1.
   */
  version: number;
  type: number;
  mode: number;
  collateralHash: string;
  /**
   * uint_32    4    The collateral index.
   */
  collateralIndex: number;
  /**
   * service address, ip and port
   */
  service: string;
  /**
   * CKeyID    20    The public key hash used for owner related signing (ProTx updates, governance voting)
   */
  keyIDOwner: string;
  /**
   * BLSPubKey    48    The public key used for operational related signing (network messages, ProTx updates)
   */
  pubKeyOperator: string;
  /**
   * CKeyID    20    The public key hash used for voting.
   */
  keyIDVoting: string;
  /**
   * uint_16    2    A value from 0 to 10000.
   */
  operatorReward: number;
  /**
   * Script    Variable    Payee script (p2pkh/p2sh)
   */
  scriptPayout: string;
  /**
   * uint256    32    Hash of all the outpoints of the transaction inputs
   */
  inputsHash: string;
  /**
   * Size of the Signature
   */
  payloadSigSize?: number;
  /**
   * Signature of the hash of the ProTx fields. Signed with keyIDOwner
   */
  payloadSig?: string;
}
