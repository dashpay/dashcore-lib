/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Hash = require('../crypto/hash');

var HashUtil = {
  getRandomHashHexString: function getRandomHashHexString() {
    return Hash.sha256sha256(Buffer.from(Math.random().toString())).toString(
      'hex'
    );
  },
};

module.exports = HashUtil;
