/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit
var binaryRegex = /^[0-1]*$/;

/**
 * @param {string} bitString
 * @return {boolean}
 */
function isBitString(bitString) {
  return binaryRegex.test(bitString);
}

function toBitString(bitArray) {
  if (!Array.isArray(bitArray)) {
    throw new TypeError("Argument is not a bit array");
  }
  return bitArray.map(function(bool) {
    return Number(bool);
  }).join('');
}

/**
 * Converts boolean array to uint8 array, i.e:
 * [true, true, true, true, true, true, true, true] will be converted to [255]
 * @param {boolean[]|number[]} bitArray
 * @param {boolean} [reverseBits]
 * @return {number[]}
 */
function convertBitArrayToUInt8Array(bitArray, reverseBits) {
  var bitString = toBitString(bitArray);
  return bitStringToUInt8Array(bitString, reverseBits);
}

/**
 * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
 * @param {string} bitString
 * @param {boolean} reverseBits
 * @return {number[]}
 */
function bitStringToUInt8Array(bitString, reverseBits) {
  if (!isBitString(bitString)) {
    throw new TypeError("Argument is not a bit array");
  }
  var byteStrings = bitString.match(/.{1,8}/g);
  return byteStrings.map(function (byteString) {
    if (reverseBits) {
      byteString = byteString.split("").reverse().join("");
    }
    return parseInt(byteString, 2);
  });
}

function uint8ArrayToBitString(uin8arr) {
  return uin8arr
    .map(function(num) {
      return num.toString(2);
    })
    .reduce(function (acc, val) {
      // Add leading zeros if needed
      if (val.length < 8) {
        val = '0'.repeat(8 - val.length) + val;
      }
      return acc + val
    }, '');
}

function uint8ArrayToBitArray(uin8arr) {
  var bits = [];
  return uin8arr
    .reduce(function (acc, num) {
      return combineArray(acc, numberToBitArray(num));
    }, '');
}

// Convert a number into a bit array
function numberToBitArray (number) {
  var bits = [];
  var q = number;
  do {
    bits.push(q % 2);
    q = Math.floor(q / 2);
  } while (q > 0);
  return bits;
}

function combineArray (array1, array2) {
  return [...array1, ...array2];
}

module.exports = {
  convertBitArrayToUInt8Array: convertBitArrayToUInt8Array,
  uint8ArrayToBitString: uint8ArrayToBitString,
  uint8ArrayToBitArray: uint8ArrayToBitArray,
};
