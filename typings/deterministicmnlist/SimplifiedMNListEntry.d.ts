import { BufferReader } from '../buffer/BufferReader';

/**
 * @typedef {Object} SMLEntry
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} [service] - ip and port, derived from addresses when omitted for v3
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */
export type SMLEntry = {
  proRegTxHash: string;
  confirmedHash: string;
  service?: string;
  pubKeyOperator: string;
  votingAddress: string;
  isValid: boolean;
  nVersion?: number;
  nType?: number;
  platformHTTPPort?: number;
  platformNodeID?: string;
  addresses?: Record<string, string[]>;
  payoutAddress?: string;
  operatorPayoutAddress?: string;
};

/**
 * @class SimplifiedMNListEntry
 * @param {string|Object|Buffer} arg - A Buffer, JSON string, or Object representing a SmlEntry
 * @param {string} [network]
 * @constructor
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */
export class SimplifiedMNListEntry {
  addresses?: Record<string, string[]>;

  constructor(arg: string | any | Buffer, network?: string);

  /**
   * Parse buffer and returns SimplifiedMNListEntry
   * @param {Buffer} buffer
   * @param {string} [network]
   * @return {SimplifiedMNListEntry}
   */
  static fromBuffer(buffer: Buffer, network?: string): SimplifiedMNListEntry;

  /**
   * Reads an entry as Core sends it in the P2P `mnlistdiff` message:
   * nVersion followed by the hashed fields (see toP2PBuffer)
   * @param {BufferReader} bufferReader
   * @param {string} [network]
   * @return {SimplifiedMNListEntry}
   */
  static fromP2PBufferReader(
    bufferReader: BufferReader,
    network?: string
  ): SimplifiedMNListEntry;

  /**
   * @param {string} string
   * @param {string} [network]
   * @return {SimplifiedMNListEntry}
   */
  static fromHexString(string: string, network?: string): SimplifiedMNListEntry;

  /**
   * Serialize SML entry to buffer
   * @return {Buffer}
   */
  toBuffer(): Buffer;

  /**
   * Serialize SML entry as Core sends it in the P2P `mnlistdiff` message
   * (protocol 70228 and later): nVersion, then the fields toBuffer() hashes
   * @return {Buffer}
   */
  toP2PBuffer(): Buffer;

  /**
   * Create SMLEntry from an object
   * @param {SMLEntry} obj
   * @return {SimplifiedMNListEntry}
   */
  static fromObject(obj: SMLEntry): SimplifiedMNListEntry;

  /**
   * @return {Buffer}
   */
  calculateHash(): Buffer;

  /**
   * Gets the ip from the service property
   * @return {string}
   */
  getIp(): string;

  /**
   * Gets the evonode's Platform HTTPS endpoint: the first `platform_https` address
   * of a version 3 (ExtAddr) entry, which may be an IPv6 address or a domain, or
   * the service ip with platformHTTPPort of an older one. PoSe-banned entries
   * have endpoints too; check isValid before using one.
   * @return {{host: string, port: number}|null} host without IPv6 brackets, like
   * getIp(); null for regular masternodes and evonodes without an address
   */
  getPlatformHTTPSEndpoint(): { host: string; port: number } | null;

  /**
   * Creates a copy of SimplifiedMNListEntry
   * @return {SimplifiedMNListEntry}
   */
  copy(): SimplifiedMNListEntry;

  proRegTxHash: string;
  confirmedHash: string;
  /**
   * ip and port
   */
  service: string;
  /**
   * operator public key
   */
  pubKeyOperator: string;
  votingAddress: string;
  isValid: boolean;
  nVersion: number;
  nType: number;
  platformHTTPPort?: number;
  payoutAddress?: string;
  platformNodeID?: string;
  operatorPayoutAddress?: string;
}
