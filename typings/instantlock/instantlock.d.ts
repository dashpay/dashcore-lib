import {BufferReader} from "../buffer/BufferReader";
import {QuorumEntry} from "../deterministicmnlist/QuorumEntry";
import {BufferWriter} from "../buffer/BufferWriter";
import {SimplifiedMNListStore} from "../deterministicmnlist/SimplifiedMNListStore";

interface RawInstantLock {
  inputs: any[],
  txid: string,
  signature: string,
}

/**
 * Instantiate a InstantLock from a Buffer, hex string, JSON object / Object with the properties
 * of the InstantLock.
 *
 * @class InstantLock
 * @param {Buffer|Object|string} [arg] - A Buffer, Hex string, JSON string, or Object
 * representing a InstantLock
 * @property {Object[]} inputs - an array of outpoints used as inputs for this tx
 * @property {string} txid
 * @property {string} signature
 */
export class InstantLock {
  constructor(arg?: Buffer | any | string);

  inputs: any[];
  txid: string;
  signature: string;

  static get ISLOCK_REQUESTID_PREFIX(): string;

  /**
   * @param {BufferReader} br A buffer reader of the block
   * @returns {InstantLock} - An instance of InstantLock
   */
  static fromBufferReader(br: BufferReader): InstantLock;

  /**
   * Creates InstantLock from a hex string.
   * @param {String} string - A hex string representation of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromString(string: string): InstantLock;

  /**
   * Creates InstantLock from a hex string.
   * @param {String} string - A hex string representation of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromHex(string: string): InstantLock

  /**
   * Creates InstantLock from a Buffer.
   * @param {Buffer} buffer - A buffer of the instantLock
   * @return {InstantLock} - An instance of InstantLock
   */
  static fromBuffer(buffer: Buffer): InstantLock;

  /**
   * Create InstantLock from an object
   * @param {Object} obj - an object with all properties of instantlock
   * @return {InstantLock}
   */
  static fromObject(obj: any): InstantLock;

  /**
   * Verify that the signature is valid against the Quorum using quorumPublicKey
   * @private
   * @param {QuorumEntry} quorumEntry - quorum entry to test signature against
   * @param {Buffer} requestId
   * @returns {Promise<Boolean>} - returns the result of the signature verification
   */
  verifySignatureAgainstQuorum(quorumEntry: QuorumEntry, requestId: Buffer): Promise<boolean>

  /**
   * @private
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset - starting height offset to identify the signatory
   * @returns {Promise<Boolean>}
   */
   verifySignatureWithQuorumOffset(smlStore: SimplifiedMNListStore, requestId: Buffer, offset: number): Promise<boolean>

  /**
   * Verifies that the signature is valid
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @returns {Promise<Boolean>} - returns the result of the verification
   */
  verify(smlStore): Promise<boolean>

  /**
   * Validate InstantLock structure
   */
  validate(): void;

  /**
   * Returns InstantLock hash
   * @returns {Buffer}
   */
  getHash(): Buffer;

  /**
   * Computes the request ID for this InstantLock
   * @returns {Buffer} - Request id for this instantlock
   */
  getRequestId(): Buffer;

  /**
   * Selects the correct quorum that signed this InstantLock
   * msgHash
   * @param {SimplifiedMNListStore} smlStore - used to reconstruct quorum lists
   * @param {Buffer} requestId
   * @param {number} offset
   * @returns {QuorumEntry} - signatoryQuorum
   */
  selectSignatoryQuorum(smlStore: SimplifiedMNListStore, requestId: Buffer, offset: number): QuorumEntry;

  /**
   * Computes signature id for a quorum entry
   * @param {QuorumEntry} quorumEntry
   * @param {Buffer} requestId
   * @returns {Buffer} - Signature id for this requestId and quorum.
   */
  getSignHashForQuorumEntry(quorumEntry: QuorumEntry, requestId: Buffer): Buffer;

  /**
   * Serializes InstantLock to JSON
   * @returns {Object} A plain object with the instantlock information
   */
  toObject(): RawInstantLock;

  /**
   * Serializes instantlock to JSON
   * @returns {Object} A plain object with the instantlock information
   */
  toJSON(): RawInstantLock;

  /**
   * Serialize InstantLock
   * @returns {string} - A hex encoded string of the instantlock
   */
  toString(): string;

  /**
   * Serialize InstantLock to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * @param {BufferWriter} bw - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the InstantLock
   */
  toBufferWriter(bw?: BufferWriter): BufferWriter;

  /**
   * Creates a copy of InstantLock
   * @return {InstantLock} - a new copy instance of InstantLock
   */
  copy(): InstantLock;

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} InstantLock block hash and height
   */
  inspect(): string;
}
