import {BufferWriter} from "../buffer/BufferWriter";
import {QuorumEntry} from "../deterministicmnlist/QuorumEntry";

/**
 * @param {Buffer|Object|string} [arg] - A Buffer, JSON string, or Object representing a Chainlock
 * @class Chainlock
 * @property {number} height
 * @property {Buffer} blockHash
 * @property {Buffer} signature
 */
export class ChainLock {
    constructor(arg?: Buffer | any | string);

    /**
     * Creates ChainLock from a Buffer.
     * @param {Buffer} buffer - A buffer of the chainLock
     * @return {ChainLock} - An instance of ChainLock
     */
    static fromBuffer(buffer: Buffer): ChainLock;
    /**
     * Creates ChainLock from a hex string.
     * @param {String} string - A hex string representation of the chainLock
     * @return {ChainLock} - An instance of ChainLock
     */
    static fromHex(string: String): ChainLock;
    static fromString(string: String): ChainLock;

    /**
     * Create ChainLock from an object
     * @param {Object} obj - an object with all properties of chainlock
     * @return {ChainLock}
     */
    static fromObject(obj: Object): ChainLock;

    /**
     * Verify that the signature is valid against the Quorum using quorumPublicKey
     * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
     * @returns {Promise<Boolean>} - if the signature is valid for this quorum
     */
    verifySignatureAgainstQuorum(quorumEntry: QuorumEntry): Promise<Boolean>;

    /**
     * Validate Chainlock structure
     */
    validate(): void;

    /**
     * Returns chainLock hash
     * @returns {Buffer}
     */
    getHash(): Buffer;

    /**
     * Computes the request ID for this ChainLock
     * @returns {Buffer} - Request id for this chainlock
     */
    getRequestId(): Buffer;

    /**
     * Computes signature id for a quorum entry
     * @param {QuorumEntry} quorumEntry
     * @returns {Buffer} - Signature id for this requestId and quorum.
     */
    getSignatureIDForQuorumEntry(quorumEntry: QuorumEntry): Buffer;

    /**
     * Serializes chainlock to JSON
     * @returns {Object} A plain object with the chainlock information
     */
    toJSON(): Object;
    toObject(): Object;

    /**
     * Serialize ChainLock
     * @return {string} - A hex encoded string of the chainlock
     */
    toString(): String;

    /**
     * Serialize ChainLock to buffer
     * @return {Buffer}
     */
    toBuffer(): Buffer;

    /**
     * Serialize ChainLock to buffer
     * @param {BufferWriter} [br] - an object with all properties of chainlock
     * @return {BufferWriter}
     */
    toBufferWriter(br?): BufferWriter;

    /**
     * Creates a copy of ChainLock
     * @return {ChainLock} - a new copy instance of ChainLock
     */
    copy(): ChainLock;

    /**
     * Will return a string formatted for the console
     *
     * @returns {string} ChainLock block hash and height
     */
    inspect(): String;

}
