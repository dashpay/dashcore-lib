import { Script } from '../script/Script';
import { BufferWriter } from '../buffer/BufferWriter';

/**
 * Instantiate an Output from an Object

 * @param args
 * @returns {Output}
 * @constructor
 */
export class Output {
  constructor(args: any);

  satoshis: number;
  script: Script;

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Output
   */
  inspect(): string;

  /**
   * @function
   * Tests if the satoshis amount is invalid
   * @returns {String|Boolean} return reason as string if invalid, or false
   */
  invalidSatoshis(): String | Boolean;

  /**
   * @function
   * @returns {Object} A plain object with the output information
   */
  toObject(): Object;

  /**
   * @function
   * @returns {Object} A plain object with the output information
   */
  toJSON(): Object;

  /**
   * Instantiate an address from an Object
   *
   * @param {Object} data - An Object containing satoshis and script
   * @returns {Output} A instance of an Output
   */
  static fromObject(data: Object): Output;

  /**
   * Set a script from a Buffer
   * Replace any previously set script
   *
   * @param {Buffer} buffer
   * @return {Output}
   */
  setScriptFromBuffer(buffer: Buffer): Output;
  /**
   * Set a script from a Script, a buffer or it's String representation.
   * Replace any previously set script
   *
   * @param {Script|Buffer|String} script
   * @return {Output}
   */
  setScript(script: Script | Buffer | String): Output;

  /**
   * Will create an Output from a bufferReader
   *
   * @returns {Output} output
   */
  static fromBufferReader(): Output;

  /**
   * Will return a BufferWriter instance with Output as value
   *
   * @returns {BufferWriter} writer
   */
  toBufferWriter(): BufferWriter;
}
