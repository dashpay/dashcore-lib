/**
 * Whether value is an array whose own enumerable keys are exactly its indexes
 * '0'..String(length - 1): no empty slots and no extra properties. Serializers
 * check this before writing a count, since forEach skips holes. Object.keys
 * lists only present keys, so a huge sparse length is never materialized.
 * @param {*} value
 * @return {boolean}
 */
function isDenseArray(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  // an array's integer keys come first, in ascending order
  const keys = Object.keys(value);
  return keys.length === value.length && keys.every((key, i) => key === String(i));
}

module.exports = isDenseArray;
