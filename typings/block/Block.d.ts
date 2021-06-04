import { BufferReader } from '../buffer/BufferReader';
import { BufferWriter } from '../buffer/BufferWriter';
import { BlockHeader } from './BlockHeader';
import { Transaction } from '../transaction/Transaction';

export namespace Block {
  /**
   * @typedef {Object} Block.fromObjectParams
   * @property {Transaction.toObjectParams[]} transactions
   * @property {BlockHeader.toObjectParams} header
   */
  type fromObjectParams = {
    transactions: Transaction[];
    header: BlockHeader.toObjectParams;
  };
  /**
   * @typedef {Object} Block.toObjectParams
   * @property {string} string
   * @property {number} version
   * @property {string} prevHash
   * @property {string} merkleRoot
   * @property {number} time
   * @property {number} bits
   * @property {number} nonce
   */
  type toObjectParams = {
    hash: string;
    version: number;
    prevHash: string;
    merkleRoot: string;
    time: number;
    bits: number;
    nonce: number;
  };

  type Values = {
    START_OF_BLOCK: number;
    NULL_HASH: Buffer;
  };
}

/**
 * Instantiate a Block from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {Buffer|Block.fromObjectParams} arg - A Buffer, JSON string, or Object
 * @returns {Block}
 * @constructor
 */
export class Block {
  constructor(arg: any);

  id: string;
  hash: string;
  header: BlockHeader;
  transactions: Transaction[];
  /**
   * @property {Block.fromObjectParams} obj - A plain JavaScript object
   * @returns {Block} - An instance of block
   */
  static fromObject(obj: Block.fromObjectParams): Block;

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
   * @returns {Block.toObjectParams} - A plain object with the block properties
   */
  toObject(): {
    header: BlockHeader.toObjectParams;
    transactions: Transaction.toObject[];
  };

  /**
   * @function
   * @returns {Object} - A plain object with the block properties
   */
  toJSON(): any;

  /**
   * @returns {Buffer} - A buffer of the block
   */
  toBuffer(): Buffer;

  /**
   * @returns {string} - A hex encoded string of the block
   */
  toString(): string;

  /**
   * @param {BufferWriter} bw - An existing instance of BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the Block
   */
  toBufferWriter(bw: BufferWriter): BufferWriter;

  /**
   * Will iterate through each transaction and return an array of hashes
   * @returns {Buffer[]} - An array with transaction hashes
   */
  getTransactionHashes(): Buffer[];

  /**
   * Will build a merkle tree of all the transactions, ultimately arriving at
   * a single point, the merkle root.
   * @link https://en.bitcoin.it/wiki/Protocol_specification#Merkle_Trees
   * @returns {Buffer[]} - An array with each level of the tree after the other.
   */
  getMerkleTree(): Buffer[];

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
