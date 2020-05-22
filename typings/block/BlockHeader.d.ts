import { BufferReader } from "../buffer/BufferReader"
import { BufferWriter } from "../buffer/BufferWriter"
import BN from "../crypto/BN"

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
export class BlockHeader {
    constructor();

    /**
     * @param {Object} - A plain JavaScript object
     * @returns {BlockHeader} - An instance of block header
     */
    static fromObject(obj: any): BlockHeader;

    /**
     * @param {Buffer|string} data Raw block binary data or buffer
     * @returns {BlockHeader} - An instance of block header
     */
    static fromRawBlock(data: Buffer | string): BlockHeader;

    /**
     * @param {Buffer} - A buffer of the block header
     * @returns {BlockHeader} - An instance of block header
     */
    static fromBuffer(buf: Buffer): BlockHeader;

    /**
     * @param {string} - A hex encoded buffer of the block header
     * @returns {BlockHeader} - An instance of block header
     */
    static fromString(str: string): BlockHeader;

    /**
     * @param {BufferReader} - A BufferReader of the block header
     * @returns {BlockHeader} - An instance of block header
     */
    static fromBufferReader(br: BufferReader): BlockHeader;

    /**
     * @function
     * @returns {Object} - A plain object of the BlockHeader
     */
    toObject(): any;

    /**
     * @returns {Buffer} - A Buffer of the BlockHeader
     */
    toBuffer(): Buffer;

    /**
     * @returns {string} - A hex encoded string of the BlockHeader
     */
    toString(): string;

    /**
     * @param {BufferWriter} - An existing instance BufferWriter
     * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
     */
    toBufferWriter(bw: BufferWriter): BufferWriter;

    /**
     * Returns the target difficulty for this block
     * @param {Number} bits
     * @returns {BN} An instance of BN with the decoded difficulty bits
     */
    getTargetDifficulty(bits: number): BN;

    /**
     * @link https://en.bitcoin.it/wiki/Difficulty
     * @return {Number}
     */
    getDifficulty(): number;

    /**
     * @returns {Buffer} - The little endian hash buffer of the header
     */
    _getHash(): Buffer;

    /**
     * @returns {Boolean} - If timestamp is not too far in the future
     */
    validTimestamp(): boolean;

    /**
     * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
     */
    validProofOfWork(): boolean;

    /**
     * @returns {string} - A string formatted for the console
     */
    inspect(): string;
}
