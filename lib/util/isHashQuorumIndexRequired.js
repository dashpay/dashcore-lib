const { HASH_QUORUM_INDEX_REQUIRED_VERSION, BASIC_BLS_SCHEME_HASH_QUORUM_INDEX_REQUIRED_VERSION } = require('../constants');

/**
 *
 * @param {number} version
 * @return {boolean}
 */
function isHashQuorumIndexRequired(version) {
  return version === HASH_QUORUM_INDEX_REQUIRED_VERSION
    || version === BASIC_BLS_SCHEME_HASH_QUORUM_INDEX_REQUIRED_VERSION;
}

module.exports = isHashQuorumIndexRequired;
