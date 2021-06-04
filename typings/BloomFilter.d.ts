import Filter from 'bloom-filter';
/**
 * @memberOf BloomFilter
 * A constructor for Bloom Filters
 * @see https://github.com/bitpay/bloom-filter
 *
 * A Bloom Filter implemented as for use in Bitcoin Connection Bloom Filtering (BIP37) that
 * uses version 3 of the 32-bit Murmur hash function.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/bloom.cpp
 *
 * @param {Object} data - The data object used to initialize the filter.
 * @param {Array} data.vData - The data of the bloom filter.
 * @param {Number} data.nHashFuncs - The number of hash functions.
 * @param {Number} data.nTweak - A random value to seed the hash functions.
 * @param {Number} data.nFlag - A flag to determine how matched items are added to the filter.
 * @constructor
 */
export class BloomFilter {
  vData: [];
  nHashFuncs: Number;
  nTweak: Number;
  nFlags: Number;

  /**
   * @memberOf BloomFilter
   * A constructor for Bloom Filters
   * @see https://github.com/bitpay/bloom-filter
   * @param {Buffer} payload
   * @return Filter
   */
  static fromBuffer(payload: Buffer): Filter;
  /**
   * Will return a buffer representation of the address
   *
   * @returns {Buffer}
   */
  toBuffer(): Buffer;
}
