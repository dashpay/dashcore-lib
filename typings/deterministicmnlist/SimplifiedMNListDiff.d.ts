import { SimplifiedMNListEntry } from './SimplifiedMNListEntry';
import { PartialMerkleTree } from '../block/PartialMerkleTree';
import { Transaction } from '../transaction/Transaction';

/**
 * Note that this property contains ALL masternodes, including banned ones.
 * Use getValidMasternodesList() method to get the list of only valid nodes.
 * This in needed for merkleRootNMList calculation
 * @type {SimplifiedMNListEntry[]}
 */
export var mnList: SimplifiedMNListEntry[];

/**
 * This property contains only valid, not PoSe-banned nodes.
 * @type {SimplifiedMNListEntry[]}
 */
export var validMNs: SimplifiedMNListEntry[];

/**
 * @param {Buffer|Object|string} [arg] - A Buffer, JSON string, or Object representing a MnListDiff
 * @param {string} [network]
 * @class SimplifiedMNListDiff
 * @property {string} baseBlockHash - sha256
 * @property {string} blockHash - sha256
 * @property {PartialMerkleTree} cbTxMerkleTree
 * @property {Transaction} cbTx
 * @property {Array<string>} deletedMNs - sha256 hashes of deleted MNs
 * @property {Array<SimplifiedMNListEntry>} mnList
 * @property {string} merkleRootMNList - merkle root of the whole mn list
 */
export class SimplifiedMNListDiff {
  constructor(arg?: Buffer | any | string, network?: string);

  /**
   * Creates MnListDiff from a Buffer.
   * @param {Buffer} buffer
   * @param {string} [network]
   * @return {SimplifiedMNListDiff}
   */
  static fromBuffer(buffer: Buffer, network?: string): SimplifiedMNListDiff;

  /**
   * @param {string} hexString
   * @param {string} [network]
   * @return {SimplifiedMNListDiff}
   */
  static fromHexString(
    hexString: string,
    network?: string
  ): SimplifiedMNListDiff;

  /**
   * Serializes mnlist diff to a Buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * Creates MNListDiff from object
   * @param obj
   * @param {string} [network]
   * @return {SimplifiedMNListDiff}
   */
  static fromObject(obj: any, network?: string): SimplifiedMNListDiff;

  /**
   * sha256
   */
  baseBlockHash: string;
  /**
   * sha256
   */
  blockHash: string;
  cbTxMerkleTree: PartialMerkleTree;
  cbTx: Transaction;
  /**
   * sha256 hashes of deleted MNs
   */
  deletedMNs: string[];
  mnList: SimplifiedMNListEntry[];
  /**
   * merkle root of the whole mn list
   */
  merkleRootMNList: string;
}
