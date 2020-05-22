import {BufferReader} from '../buffer/BufferReader';
import {BufferWriter} from '../buffer/BufferWriter';

/**
 * Instantiate a Block from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {Block}
 * @constructor
 */
export class Block {
    constructor(arg: any);

    /**
     * @param {Object} - A plain JavaScript object
     * @returns {Block} - An instance of block
     */
    static fromObject(obj: any): Block;

    /**
     * @param {BufferReader} br A buffer reader of the block
     * @returns {Block} - An instance of block
     */
    static fromBufferReader(br: BufferReader): Block;

    /**
     * @param {Buffer} buf A buffer of the block
     * @returns {Block} - An instance of block
     */
    static fromBuffer(buf: Buffer): Block;

    /**
     * @param {string} str - A hex encoded string of the block
     * @returns {Block} - A hex encoded string of the block
     */
    static fromString(str: string): Block;

    /**
     * @param {Buffer} data Raw block binary data or buffer
     * @returns {Block} - An instance of block
     */
    static fromRawBlock(data: Buffer): Block;

    /**
     * @function
     * @returns {Object} - A plain object with the block properties
     */
    toObject(): any;

    /**
     * @returns {Buffer} - A buffer of the block
     */
    toBuffer(): Buffer;

    /**
     * @returns {string} - A hex encoded string of the block
     */
    toString(): string;

    /**
     * @param {BufferWriter} - An existing instance of BufferWriter
     * @returns {BufferWriter} - An instance of BufferWriter representation of the Block
     */
    toBufferWriter(bw: BufferWriter): BufferWriter;

    /**
     * Will iterate through each transaction and return an array of hashes
     * @returns {Array} - An array with transaction hashes
     */
    getTransactionHashes(): any[];

    /**
     * Will build a merkle tree of all the transactions, ultimately arriving at
     * a single point, the merkle root.
     * @link https://en.bitcoin.it/wiki/Protocol_specification#Merkle_Trees
     * @returns {Array} - An array with each level of the tree after the other.
     */
    getMerkleTree(): any[];

    /**
     * Calculates the merkleRoot from the transactions.
     * @returns {Buffer} - A buffer of the merkle root hash
     */
    getMerkleRoot(): Buffer;

    /**
     * Verifies that the transactions in the block match the header merkle root
     * @returns {Boolean} - If the merkle roots match
     */
    validMerkleRoot(): boolean;

    /**
     * @returns {Buffer} - The little endian hash buffer of the header
     */
    _getHash(): Buffer;

    /**
     * @returns {string} - A string formatted for the console
     */
    inspect(): string;
}
