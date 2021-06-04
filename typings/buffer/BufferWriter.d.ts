import { BN } from '../crypto/BN';

/**
 *
 * @param obj
 * @returns {BufferWriter}
 * @constructor
 */
export class BufferWriter {
  constructor(obj: any);
  /**
   * Set a list of buffers locally
   * @param {Buffer[]} obj.bufs - an array of buffer
   * @return {BufferWriter}
   */
  set(obj: { bufs: Buffer[] }): BufferWriter;
  /**
   * Returns a buffer which is the concatenation of all the buffers.
   * @return {Buffer}
   */
  toBuffer(): Buffer;
  /**
   * Returns a buffer which is the concatenation of all the buffers.
   * @return {Buffer}
   */
  concat(): Buffer;
  /**
   * Append the buffer to the buffer array
   * @param {Buffer} buf
   * @return {BufferWriter}
   */
  write(buf: Buffer): BufferWriter;
  /**
   * Reverse the buffer passed as argument and writes it locally
   * @param {Buffer} buf
   * @return {BufferWriter}
   */
  writeReverse(buf: Buffer): BufferWriter;

  /**
   * Write a UInt8 to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeUInt8(n: number): BufferWriter;

  /**
   * Write a UInt16BE to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeUInt16BE(n: number): BufferWriter;

  /**
   * Write a UInt16LE to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeUInt16LE(n: number): BufferWriter;
  /**
   * Write a UInt32BE to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeUInt32BE(n: number): BufferWriter;
  /**
   * Write a Int32LE to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeInt32LE(n: number): BufferWriter;
  /**
   * Write a UInt32LE to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeUInt32LE(n: number): BufferWriter;

  /**
   * Write a UInt64BEBN to the local buffer array
   * @param {BN} bn
   * @return {BufferWriter}
   */
  writeUInt64BEBN(bn: BN): BufferWriter;

  /**
   * Write a UInt64LEBN to the local buffer array
   * @param {BN} bn
   * @return {BufferWriter}
   */
  writeUInt64LEBN(bn: BN): BufferWriter;

  /**
   * Write a VarintNum to the local buffer array
   * @param {number} n
   * @return {BufferWriter}
   */
  writeVarintNum(n: number): BufferWriter;

  /**
   * Write a varIntBN to local buffer
   * @param {BN} bn
   * @return {BufferWriter}
   */
  writeVarintBN(bn: BN): BufferWriter;

  /**
   * Return a new buffer based on on BN argument
   * @param {BN} bn
   * @return Buffer
   */
  static varintBufBN(): Buffer;

  /**
   * Return a varInt buffer based on input number
   * @param {number} n - a number
   * @return Buffer
   */
  static varintBufNum(n: number): Buffer;
}
