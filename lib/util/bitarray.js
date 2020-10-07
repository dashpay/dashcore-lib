const binaryRegex = /^[0-1]*$/;

/**
 * @param {string} bitString
 * @return {boolean}
 */
function isBitString(bitString) {
  return binaryRegex.test(bitString);
}

function toBitString(bitArray) {
  if (!Array.isArray(bitArray)) {
    throw new TypeError('Argument is not a bit array');
  }
  return bitArray.map(bool => Number(bool)).join('');
}

/**
 * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
 * @param {string} bitString
 * @param {boolean} reverseBits
 * @return {number[]}
 */
function bitStringToUInt8Array(bitString, reverseBits) {
  if (!isBitString(bitString)) {
    throw new TypeError('Argument is not a bit array');
  }
  const byteStrings = bitString.match(/.{1,8}/g);
  return byteStrings.map((byteString) => {
    if (reverseBits) {
      // eslint-disable-next-line no-param-reassign
      byteString = byteString.split('').reverse().join('');
    }
    return parseInt(byteString, 2);
  });
}

/**
 * Converts boolean array to uint8 array, i.e:
 * [true, true, true, true, true, true, true, true] will be converted to [255]
 * @param {boolean[]|number[]} bitArray
 * @param {boolean} [reverseBits]
 * @return {number[]}
 */
function convertBitArrayToUInt8Array(bitArray, reverseBits) {
  const bitString = toBitString(bitArray);
  return bitStringToUInt8Array(bitString, reverseBits);
}

function uint8ArrayToBitString(uin8arr) {
  return uin8arr
    .map(num => num.toString(2))
    .reduce((acc, val) => {
      let standardizedValue = val;
      // Add leading zeros if needed
      if (standardizedValue.length < 8) {
        standardizedValue = '0'.repeat(8 - standardizedValue.length) + standardizedValue;
      }
      return acc + standardizedValue;
    }, '');
}

// Convert a number into a bit array
function numberToBitArray(number) {
  const bits = [];
  let q = number;
  do {
    bits.push(q % 2);
    q = Math.floor(q / 2);
  } while (q > 0);
  return bits;
}

function combineArray(array1, array2) {
  return [...array1, ...array2];
}

function uint8ArrayToBitArray(uin8arr) {
  return uin8arr
    .reduce((acc, num) => combineArray(acc, numberToBitArray(num)), '');
}

module.exports = {
  convertBitArrayToUInt8Array,
  uint8ArrayToBitString,
  uint8ArrayToBitArray,
};
