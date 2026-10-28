// Strict reads for the shared masternode payload parsers. BufferReader.read()
// silently returns fewer bytes than requested and readVarintNum() accepts
// non-canonical sizes; Core's deserializer rejects both.

// Largest CompactSize Core accepts (MAX_SIZE in src/serialize.h)
const MAX_SIZE = 0x02000000;

/**
 * Reads exactly length bytes, or throws if fewer remain
 * @param {BufferReader} reader
 * @param {number} length
 * @return {Buffer}
 */
function readExact(reader, length) {
  if (reader.buf.length - reader.pos < length) {
    throw new Error(
      `Failed to parse payload: expected ${length} more bytes, found ${
        reader.buf.length - reader.pos
      }`
    );
  }
  return reader.read(length);
}

/**
 * Reads exactly length bytes into a new, byte-reversed buffer
 * @param {BufferReader} reader
 * @param {number} length
 * @return {Buffer}
 */
function readExactReverse(reader, length) {
  return Buffer.from(readExact(reader, length)).reverse();
}

/**
 * Reads a CompactSize the way Core's ReadCompactSize does: the shortest
 * encoding only, and at most MAX_SIZE
 * @param {BufferReader} reader
 * @return {number}
 */
function readCompactSize(reader) {
  const first = readExact(reader, 1)[0];
  let size;
  let minimum = 0;
  if (first < 0xfd) {
    size = first;
  } else if (first === 0xfd) {
    size = readExact(reader, 2).readUInt16LE(0);
    minimum = 0xfd;
  } else if (first === 0xfe) {
    size = readExact(reader, 4).readUInt32LE(0);
    minimum = 0x10000;
  } else {
    const bytes = readExact(reader, 8);
    size = bytes.readUInt32LE(4) * 0x100000000 + bytes.readUInt32LE(0);
    minimum = 0x100000000;
  }
  if (size < minimum) {
    throw new Error('Failed to parse payload: non-canonical CompactSize');
  }
  if (size > MAX_SIZE) {
    throw new Error('Failed to parse payload: CompactSize too large');
  }
  return size;
}

/**
 * Reads a CompactSize-prefixed byte vector
 * @param {BufferReader} reader
 * @return {Buffer}
 */
function readVarBytes(reader) {
  return readExact(reader, readCompactSize(reader));
}

module.exports = {
  readExact,
  readExactReverse,
  readCompactSize,
  readVarBytes,
};
