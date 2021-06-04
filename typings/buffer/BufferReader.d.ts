import { BN } from '../crypto/BN';

/**
 *
 * @param buf
 * @returns {BufferReader}
 * @constructor
 */
export class BufferReader {
  constructor(buf: any);

  pos: number;
  buf: Buffer;

  /**
   * reads a length prepended buffer
   */
  readVarLengthBuffer(): void;

  /**
   * Return the whole buffer
   * @return {Buffer}
   */
  readAll(): Buffer;

  /**
   * Read the next UInt8
   * @return {number}
   */
  readUInt8(): number;

  /**
   * Read the next UInt16BE
   * @return {number}
   */
  readUInt16BE(): number;

  /**
   * Read the next UInt16LE
   * @return {number}
   */
  readUInt16LE(): number;
  /**
   * Read the next UInt32BE
   * @return {number}
   */
  readUInt32BE(): number;
  /**
   * Read the next UInt32LE
   * @return {number}
   */
  readUInt32LE(): number;
  /**
   * Read the next Int32LE
   * @return {number}
   */
  readInt32LE(): number;
  /**
   * Read the next UInt64BEBN
   * @return {number}
   */
  readUInt64BEBN(): number;
  /**
   * Read the next UInt64LEBN
   * @return {number}
   */
  readUInt64LEBN(): number;
  /**
   * RRead the next VarintNum
   * @return {number}
   */
  readVarintNum(): number;
  /**
   * reads a length prepended buffer
   * @return {Buffer}
   */
  readVarLengthBuffer(): Buffer;
  /**
   * Read the next VarIntBuffer
   * @return {Buffer}
   */
  readVarintBuf(): Buffer;
  /**
   * Read the next VarintBN
   * @return {BN}
   */
  readVarintBN(): BN;
  /**
   * Reverse buffer locally
   * @return {BufferReader}
   */
  reverse(): BufferReader;
  /**
   * Read all and reverse
   * @return {Buffer}
   */
  readReverse(): Buffer;
}
