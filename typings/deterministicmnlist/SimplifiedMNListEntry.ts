/**
 * @typedef {Object} SMLEntry
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 */
export type SMLEntry = {
    proRegTxHash: string;
    confirmedHash: string;
    service: string;
    pubKeyOperator: string;
    votingAddress: string;
    isValid: boolean;
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
 */
export class SimplifiedMNListEntry {
    constructor(arg: string | any | Buffer, network?: string);

    /**
     * Parse buffer and returns SimplifiedMNListEntry
     * @param {Buffer} buffer
     * @param {string} [network]
     * @return {SimplifiedMNListEntry}
     */
    static fromBuffer(buffer: Buffer, network?: string): SimplifiedMNListEntry;

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
}
