import { BlockHeader } from './BlockHeader';
import { BufferReader } from '../buffer/BufferReader';
import { BufferWriter } from '../buffer/BufferWriter';

/**
 * Instantiate a MerkleBlock from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {Buffer|string|{
 *    header: BlockHeader|Object,
 *    numTransactions: number,
 *    hashes: string[],
 *    flags: number[]
 *  }} arg A Buffer, JSON string, or Object representing a MerkleBlock
 * @returns {MerkleBlock}
 * @constructor
 */
export class MerkleBlock {
  constructor(arg: Buffer | string | any);

  /**
   * @name MerkleBlock#header
   * @type {BlockHeader}
   */
  header: BlockHeader;
  /**
   * @name MerkleBlock#numTransactions
   * @type {Number}
   */
  numTransactions: number;
  /**
   * @name MerkleBlock#hashes
   * @type {String[]}
   */
  hashes: String[];
  /**
   * @name MerkleBlock#flags
   * @type {Number[]}
   */
  flags: Number[];

  /**
   * Builds merkle block from block header, transaction hashes and filter matches
   * @param {BlockHeader|Object} header
   * @param {Buffer[]} transactionHashes
   * @param {boolean[]} filterMatches
   * @return {MerkleBlock}
   */
  static build(
    header: BlockHeader | any,
    transactionHashes: Buffer[],
    filterMatches: boolean[]
  ): MerkleBlock;

  /**
   * @param {Buffer} buf - MerkleBlock data in a Buffer object
   * @returns {MerkleBlock} - A MerkleBlock object
   */
  static fromBuffer(buf: Buffer): MerkleBlock;

  /**
   * @param {BufferReader} br - MerkleBlock data in a BufferReader object
   * @returns {MerkleBlock} - A MerkleBlock object
   */
  static fromBufferReader(br: BufferReader): MerkleBlock;

  /**
   * @returns {Buffer} - A buffer of the block
   */
  toBuffer(): Buffer;

  /**
   * @param {BufferWriter} bw - An existing instance of BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the MerkleBlock
   */
  toBufferWriter(bw: BufferWriter): BufferWriter;

  /**
   * @function
   * @returns {Object} - A plain object with the MerkleBlock properties
   */
  toObject(): any;

  /**
   * @function
   * @returns {Object} - A plain object with the MerkleBlock properties
   */
  toJSON(): any;

  /**
   * Verify that the MerkleBlock is valid
   * @returns {Boolean} - True/False whether this MerkleBlock is Valid
   */
  validMerkleTree(): boolean;

  /**
   * @return {string[]}
   */
  getMatchedTransactionHashes(): string[];

  /**
   * @param {Object} obj - A plain JavaScript object
   * @returns {MerkleBlock} - An instance of block
   */
  static fromObject(obj: any): MerkleBlock;
}
