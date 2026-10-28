import {
  MasternodeAddresses,
  MasternodePayout,
  MasternodePayoutJSON,
} from './MasternodePayout';

/**
 * One participant's share of a shared masternode's collateral
 * @typedef {Object} CollateralShare
 * @property {number} amount - contributed collateral in duffs
 * @property {string} scriptRefund - refund script (p2pkh/p2sh)
 * @property {string} scriptReward - reward script (p2pkh/p2sh), empty to reward scriptRefund
 * @property {string} keyIDOwner - the share owner's public key hash
 */
export type CollateralShare = {
  amount: number;
  scriptRefund: string;
  scriptReward: string;
  keyIDOwner: string;
};

/**
 * @typedef {Object} CollateralShareJSON
 * @property {number} amount - contributed collateral in duffs
 * @property {string} refundAddress
 * @property {string} [rewardAddress] - omitted when rewards go to refundAddress
 * @property {string} keyIDOwner - the share owner's public key hash
 */
export type CollateralShareJSON = {
  amount: number;
  refundAddress: string;
  rewardAddress?: string;
  keyIDOwner: string;
};

/**
 * @typedef {Object} ProRegTxPayloadJSON
 * @property {number} version    uint_16    2    Provider transaction version number. Currently set to 1.
 * @property {number} [type] Masternode type, regular (0) if omitted
 * @property {string} collateralHash
 * @property {number} collateralIndex    uint_32    4    The collateral index.
 * @property {string} [service] - service address, ip and port. Before version 3
 * @property {MasternodeAddresses} [addresses] - "addr:port" lists by purpose. From version 3
 * @property {string} keyIDOwner    CKeyID    20    The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} pubKeyOperator    BLSPubKey    48    The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting    CKeyID    20    The public key hash used for voting.
 * @property {number} operatorReward    uint_16    2    A value from 0 to 10000.
 * @property {string} [payoutAddress] Before version 3
 * @property {MasternodePayoutJSON[]} [payouts] Owner payees with their reward shares. From version 3
 * @property {CollateralShareJSON[]} [shares] Collateral shares of a shared masternode. From version 3
 * @property {string[]} [joinSigs] One compact signature per share. From version 3
 * @property {number} [earlyPeriodBlocks] From version 3
 * @property {number} [earlyPenalty] In duffs. From version 3
 * @property {string} inputsHash    uint256    32    Hash of all the outpoints of the transaction inputs
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port. Before version 3
 * @property {number} [platformHTTPPort] Platform HTTP port. Before version 3
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with keyIDOwner
 */
export type ProRegTxPayloadJSON = {
  version: number;
  type?: number;
  collateralHash: string;
  collateralIndex: number;
  service?: string;
  addresses?: MasternodeAddresses;
  keyIDOwner: string;
  pubKeyOperator: string;
  keyIDVoting: string;
  operatorReward: number;
  payoutAddress?: string;
  payouts?: MasternodePayoutJSON[];
  shares?: CollateralShareJSON[];
  joinSigs?: string[];
  earlyPeriodBlocks?: number;
  earlyPenalty?: number;
  inputsHash: string;
  payloadSigSize?: number;
  payloadSig?: string;
  platformNodeID?: string;
  platformP2PPort?: number;
  platformHTTPPort?: number;
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
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {number} [platformP2PPort] Platform P2P port
 * @property {number} [platformHTTPPort] Platform HTTP port
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
   * service address, ip and port. Before version 3
   */
  service?: string;
  /**
   * "addr:port" lists by purpose. From version 3
   */
  addresses?: MasternodeAddresses;
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
   * Script    Variable    Payee script (p2pkh/p2sh). Before version 3
   */
  scriptPayout?: string;
  /**
   * Owner payees with their reward shares. From version 3
   */
  payouts?: MasternodePayout[];
  /**
   * Collateral shares of a shared masternode, empty if not shared. From version 3
   */
  shares?: CollateralShare[];
  /**
   * One 65 byte compact signature per share. From version 3
   */
  joinSigs?: string[];
  /**
   * uint_32. From version 3
   */
  earlyPeriodBlocks?: number;
  /**
   * In duffs. From version 3
   */
  earlyPenalty?: number;
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
  /*
   * Platform Node ID
   */
  platformNodeID?: string;
  /*
   * Platform P2P port
   */
  platformP2PPort?: number;
  /*
   * Platform HTTP port
   */
  platformHTTPPort?: number;
}
