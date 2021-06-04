import { BufferReader } from '../buffer/BufferReader';
/**
 * @param {Buffer|string|PartialMerkleTree|{transactionHashes: Buffer[],filterMatches: boolean[]}} [serialized]
 * @return {PartialMerkleTree}
 * @class
 * @property {number} totalTransactions
 * @property {string[]} merkleHashes
 * @property {number[]} merkleFlags
 */
export class PartialMerkleTree {
  constructor(serialized?: Buffer | string | PartialMerkleTree | any);

  /**
   * Creates an instance of PartialMerkleTree from buffer reader
   * @param {BufferReader} bufferReader
   * @return {PartialMerkleTree}
   */
  static fromBufferReader(bufferReader: BufferReader): PartialMerkleTree;

  /**
   * @param {Buffer} buffer
   * @return {PartialMerkleTree}
   */
  static fromBuffer(buffer: Buffer): PartialMerkleTree;

  /**
   * @param {string} hexString
   * @return {PartialMerkleTree}
   */
  static fromHexString(hexString: string): PartialMerkleTree;

  /**
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * @return {PartialMerkleTree}
   */
  copy(): PartialMerkleTree;

  /**
   * @return {string}
   */
  toString(): string;

  totalTransactions: number;
  merkleHashes: string[];
  merkleFlags: number[];
}
