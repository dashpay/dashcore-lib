/**
 *
 * @param buf
 * @returns {BufferReader}
 * @constructor
 */
export class BufferReader {
    constructor(buf: any);

    /**
     * reads a length prepended buffer
     */
    readVarLengthBuffer(): void;
}
