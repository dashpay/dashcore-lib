/**
 * @typedef {Object} CommitmentTxPayloadJSON
 * @property {number} version    uint16_t    2    Commitment special transaction version number. Currently set to 1. Please note that this is not the same as the version field of qfcommit
 * @property {number} height    uint16_t    2    The height of the block in which this commitment is included
 * @property {number} qfcVersion    uint16_t    2    Version of the final commitment message
 * @property {number} llmqtype    uint8_t    1    type of the long living masternode quorum
 * @property {string} quorumHash    uint256    32    The quorum identifier
 * @property {number} signersSize    compactSize uint    1-9    Bit size of the signers bitvector
 * @property {string} signers    byte[]    (bitSize + 7) / 8    Bitset representing the aggregated signers of this final commitment
 * @property {number} validMembersSize    compactSize uint    1-9    Bit size of the validMembers bitvector
 * @property {string} validMembers    byte[]    (bitSize + 7) / 8    Bitset of valid members in this commitment
 * @property {string} quorumPublicKey    BLSPubKey    48    The quorum public key
 * @property {string} quorumVvecHash    uint256    32    The hash of the quorum verification vector
 * @property {string} quorumSig    BLSSig    96    Recovered threshold signature
 * @property {string} sig    BLSSig    96    Aggregated BLS signatures from all included commitments
 */
export type CommitmentTxPayloadJSON = {
  version: number;
  height: number;
  qfcVersion: number;
  llmqtype: number;
  quorumHash: string;
  signersSize: number;
  signers: string;
  validMembersSize: number;
  validMembers: string;
  quorumPublicKey: string;
  quorumVvecHash: string;
  quorumSig: string;
  sig: string;
};

/**
 * @class CommitmentTxPayload
 * @property {number} version
 * @property {number} height
 * @property {number} qfcVersion
 * @property {number} llmqtype
 * @property {string} quorumHash
 * @property {number} signersSize
 * @property {string} signers
 * @property {number} validMembersSize
 * @property {string} validMembers
 * @property {string} quorumPublicKey
 * @property {string} quorumVvecHash
 * @property {string} quorumSig
 * @property {string} sig
 */
export class CommitmentTxPayload {
  /**
   * Parse raw payload
   * @param {Buffer} rawPayload
   * @return {CommitmentTxPayload}
   */
  static fromBuffer(rawPayload: Buffer): CommitmentTxPayload;

  /**
   * Create new instance of payload from JSON
   * @param {string|CommitmentTxPayloadJSON} payloadJson
   * @return {CommitmentTxPayload}
   */
  static fromJSON(
    payloadJson: string | CommitmentTxPayloadJSON
  ): CommitmentTxPayload;

  /**
   * Validate payload
   * @return {boolean}
   */
  validate(): boolean;

  /**
   * Serializes payload to JSON
   * @param [options]
   * @return {CommitmentTxPayload}
   */
  toJSON(options?: any): CommitmentTxPayload;

  /**
   * Serialize payload to buffer
   * @param [options]
   * @return {Buffer}
   */
  toBuffer(options?: any): Buffer;

  version: number;
  height: number;
  qfcVersion: number;
  llmqtype: number;
  quorumHash: string;
  signersSize: number;
  signers: string;
  validMembersSize: number;
  validMembers: string;
  quorumPublicKey: string;
  quorumVvecHash: string;
  quorumSig: string;
  sig: string;
}
