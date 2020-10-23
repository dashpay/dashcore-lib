import {SimplifiedMNList} from "./SimplifiedMNList";
import {SimplifiedMNListEntry} from "./SimplifiedMNListEntry";
/**
 * @class QuorumEntry
 * @param {string|Object|Buffer} [arg] - A Buffer, JSON string,
 * or Object representing a SMLQuorumEntry
 * @constructor
 * @property {number} version
 * @property {number} llmqType
 * @property {string} quorumHash
 * @property {number} signersCount
 * @property {string} signers
 * @property {number} validMembersCount
 * @property {string} validMembers
 * @property {string} quorumPublicKey
 * @property {string} quorumVvecHash
 * @property {string} quorumSig
 * @property {string} membersSig
 */
export class QuorumEntry {
    constructor(arg?: Buffer | any | string);

    /**
     * Parse buffer and returns QuorumEntry
     * @param {Buffer} buffer
     * @return {QuorumEntry}
     */
    static fromBuffer(buffer: Buffer): QuorumEntry;
    /**
     * @param {string} string
     * @return {QuorumEntry}
     */
    static fromHexString(string: String): QuorumEntry;

    /**
     * Create SMLQuorumEntry from an object
     * @param {SMLQuorumEntry} obj
     * @return {QuorumEntry}
     */
    static fromObject(obj: Object): QuorumEntry;

    /**
     * Validate QuorumEntry structure
     */
    validate(): void;

    /**
     * Serializes QuorumEntry to JSON
     * @returns {Object} A plain object with the QuorumEntry information
     */
    toObject(): Object;

    /**
     * Serialize SML entry to buf
     * @return {Buffer}
     */
    toBuffer(): Buffer;
    /**
     * Serialize SML entry to buf
     * @return {Buffer}
     */
    toBufferForHashing(): Buffer;

    /**
     * @return {number}
     */
    getParams(): number;

    /**
     * Serialize quorum entry commitment to buf
     * This is the message hash signed by the quorum for verification
     * @return {Uint8Array}
     */
    getCommitmentHash(): Uint8Array;

    /**
     * Verifies the quorum's bls threshold signature
     * @return {Promise<boolean>}
     */
    isValidQuorumSig(): Promise<boolean>;

    /**
     * Verifies the quorum's aggregated operator key signature
     * @param {SimplifiedMNList} mnList - MNList for the block (quorumHash)
     * @return {Promise<boolean>}
     */
    isValidMemberSig(mnList: SimplifiedMNList): Buffer;

    /**
     * verifies the quorum against the det. MNList that was active
     * when the quorum was starting its DKG session. Two different
     * types of BLS signature verifications are performed:
     * 1. the quorumSig is verified with the quorumPublicKey
     * 2. the quorum members are re-calculated and the memberSig is
     * verified against their aggregated pubKeyOperator values
     * @param {SimplifiedMNList} quorumSMNList - MNList for the block (quorumHash)
     * the quorum was starting its DKG session with
     * @return {Promise<boolean>}
     */
    verify(quorumSMNList: SimplifiedMNList): Promise<boolean>;

    /**
     * Get all members for this quorum
     * @param {SimplifiedMNList} SMNList - MNlist for the quorum
     * @return {SimplifiedMNListEntry[]}
     */
    getAllQuorumMembers(SMNList: SimplifiedMNList): SimplifiedMNListEntry[]

    /**
     * Gets the modifier for deterministic sorting of the MNList
     * for quorum member selection
     * @return {Buffer}
     */
    getSelectionModifier(): Buffer;

    /**
     * Gets the ordering hash for a requestId
     * @param {string} requestId - the requestId for the signing session to be verified
     * @return {Buffer}
     */
    getOrderingHashForRequestId(requestId: string): Buffer;

    /**
     * @return {Buffer}
     */
    calculateHash(): Buffer;

    /**
     * Creates a copy of QuorumEntry
     * @return {QuorumEntry} - a new copy instance of QuorumEntry
     */
    copy(): QuorumEntry;
}
