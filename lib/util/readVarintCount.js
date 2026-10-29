const { readCompactSize } = require('../transaction/payload/strictpayloadreader');

/**
 * Reads a peer-controlled item count the way Core does (shortest CompactSize
 * encoding, at most MAX_SIZE) and checks that the remaining data can hold that
 * many items. BufferReader.read() returns empty slices past the end, so without
 * this check a huge count would make the caller loop for ages.
 * @param {BufferReader} bufferReader
 * @param {number} minItemSize - smallest serialized size of one item, in bytes
 * @param {string} name - what is counted, for the error message
 * @return {number}
 */
function readVarintCount(bufferReader, minItemSize, name) {
  const count = readCompactSize(bufferReader);
  if (count * minItemSize > bufferReader.buf.length - bufferReader.pos) {
    throw new Error(`${name} count ${count} is larger than the remaining data allows`);
  }
  return count;
}

module.exports = readVarintCount;
