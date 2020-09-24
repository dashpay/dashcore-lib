/**
 * Instantiate a Opcode from it's Opcode string or number
 *
 * @example
 * ```javascript
 *
 * var opcode = Opcode(42);
 * var opcode2 = Opcode('OP_NOP');
 *
 * ```
 *
 * @param {string|number} arg - The opcode number or string
 * @returns {Opcode} A new Opcode instance
 * @constructor
 */
export class Opcode {
    constructor(arg: string|number);

    readonly num: Number;

    /**
     * @memberOf Opcode
     * @param {Opcode} opcode
     * @returns true if opcode is one of OP_0, OP_1, ..., OP_16
     */
    static isSmallIntOp(opcode): Boolean;

    /**
     * @returns map of the available opcodes
     */
    static map: Object;

    /**
     * Return a new opcode from a smallInt
     * @param {number} n - a small int
     * @return {Opcode}
     */
    static smallInt(n: number): Buffer;
    /**
     * Instantiate a Opcode from a Buffer
     *
     * @param {Buffer} buf
     * @return {Opcode}
     */
    static fromBuffer(buf: Buffer): Opcode;

    /**
     * Instantiate a Opcode from a number
     *
     * @function
     * @param {number} num - The Opcode number
     * @return {Opcode}
     */
    static fromNumber(num: number): Opcode;

    /**
     * Instantiate a Opcode from it's string format
     *
     * @function
     * @param {string} str - The Opcode in string format
     * @return {Opcode}
     */
    static fromString(str: string): Opcode;

    /**
     * Will return the Opcode as an hex
     * @return {string}
     */
    toHex(): string;

    /**
     * Will return the opcode as a buffer
     *
     * @returns {Buffer} A buffer of the opcode
     */
    toBuffer(): Buffer

    /**
     * Will output the opcode as a number
     *
     * @returns {number}
     */
    toNumber(): string;

    /**
     * Will output the opcode encoded as hex string
     *
     * @returns {string}
     */
    toString(): string;

    /**
     * Will return a string formatted for the console
     *
     * @returns {string} Script opcode
     */
    inspect(): string;
}
