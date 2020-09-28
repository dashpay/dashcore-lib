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
     * Creates a copy of QuorumEntry
     * @return {QuorumEntry} - a new copy instance of QuorumEntry
     */
    copy(): QuorumEntry;
}
