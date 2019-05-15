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

/**
 * Converts boolean array to uint8 array, i.e:
 * [true, true, true, true, true, true, true, true] will be converted to [255]
 * @param {boolean[]|number[]} bitArray
 * @return {number[]}
 */
function convertBitArrayToUInt8Array(bitArray) {
  if (!Array.isArray(bitArray)) {
    throw new TypeError("Argument is not a bit array");
  }
  var bitString = bitArray.map(function(bool) {
    return Number(bool);
  }).join('');
  return bitStringToUInt8Array(bitString);
}

/**
 * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
 * @param {string} bitString
 * @return {number[]}
 */
function bitStringToUInt8Array(bitString) {
  if (!isBitString(bitString)) {
    throw new TypeError("Argument is not a bit array");
  }
  var bytes = bitString.match(/.{1,8}/g);
  return bytes.map(function (byte) {
    return parseInt(byte, 2);
  });
}

module.exports = {
  convertBitArrayToUInt8Array: convertBitArrayToUInt8Array
};
