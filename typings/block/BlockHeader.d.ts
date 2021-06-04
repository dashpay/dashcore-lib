import { BufferReader } from '../buffer/BufferReader';
import { BufferWriter } from '../buffer/BufferWriter';
import { BN } from '../crypto/BN';

export namespace BlockHeader {
  /**
   * @typedef {Object} BlockHeader.fromObjectParams
   * @property {(string)} string
   * @property {number} version
   * @property {(string|Buffer|ArrayBuffer|SharedArrayBuffer)} prevHash
   * @property {(string|Buffer)} merkleRoot
   * @property {number} time
   * @property {number} bits
   * @property {number} nonce
   */
  type fromObjectParams = {
    hash: string;
    version: number;
    prevHash: string | Buffer;
    merkleRoot: string | Buffer;
    time: number;
    bits: number;
    nonce: number;
  };
  /**
   * @typedef {Object} BlockHeader.toObjectParams
   * @property {(string)} string
   * @property {number} version
   * @property {(string)} prevHash
   * @property {(string)} merkleRoot
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
}

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {Buffer|BlockHeader.fromObjectParams} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
export class BlockHeader {
  constructor();

  id: string;
  hash: string;
  version: number;
  prevHash: string | Buffer;
  merkleRoot: string | Buffer;
  time: number;
  bits: number;
  nonce: number;

  /**
   * @param {BlockHeader.fromObjectParams} obj - A plain JavaScript object
   * @returns {BlockHeader} - An instance of block header
   */
  static fromObject(obj: BlockHeader.fromObjectParams): BlockHeader;

  /**
   * @param {Buffer|string} data Raw block binary data or buffer
   * @returns {BlockHeader} - An instance of block header
   */
  static fromRawBlock(data: Buffer | string): BlockHeader;

  /**
   * @param {Buffer} buf - A buffer of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromBuffer(buf: Buffer): BlockHeader;

  /**
   * @param {string} str - A hex encoded buffer of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromString(str: string): BlockHeader;

  /**
   * @param {BufferReader} br - A BufferReader of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromBufferReader(br: BufferReader): BlockHeader;

  /**
   * @function
   * @returns {Object} - A plain object of the BlockHeader
   */
  toObject(): any;

  /**
   * @function
   * @returns {Object} - A plain object of the BlockHeader
   */
  toJSON(): any;

  /**
   * @returns {Buffer} - A Buffer of the BlockHeader
   */
  toBuffer(): Buffer;

  /**
   * @returns {string} - A hex encoded string of the BlockHeader
   */
  toString(): string;

  /**
   * @param {BufferWriter} bw - An existing instance BufferWriter
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
