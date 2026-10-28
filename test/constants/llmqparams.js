/* eslint-disable */

var expect = require('chai').expect;
var constants = require('../../lib/constants');

var LLMQ_TYPES = constants.LLMQ_TYPES;

describe('LLMQ_TYPE_PARAMS', function () {
  // size, threshold and signingActiveQuorumCount from src/llmq/params.h in Dash Core 24.0.0
  var coreParams = [
    [LLMQ_TYPES.LLMQ_TYPE_50_60, 50, 30, 24],
    [LLMQ_TYPES.LLMQ_TYPE_400_60, 400, 240, 4],
    [LLMQ_TYPES.LLMQ_TYPE_400_85, 400, 340, 4],
    [LLMQ_TYPES.LLMQ_TYPE_100_67, 100, 67, 24],
    [LLMQ_TYPES.LLMQ_TYPE_60_75, 60, 45, 32],
    [LLMQ_TYPES.LLMQ_TYPE_25_67, 25, 17, 24],
    [LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST, 3, 2, 2],
    [LLMQ_TYPES.LLMQ_TYPE_LLMQ_DEVNET, 12, 6, 4],
    [LLMQ_TYPES.LLMQ_TYPE_TEST_V17, 3, 2, 2],
    [LLMQ_TYPES.LLMQ_TYPE_TEST_DIP0024, 4, 3, 2],
    [LLMQ_TYPES.LLMQ_TYPE_TEST_INSTANTSEND, 3, 2, 2],
    [LLMQ_TYPES.LLMQ_DEVNET_DIP0024, 8, 4, 2],
    [LLMQ_TYPES.LLMQ_TEST_PLATFORM, 3, 2, 2],
    [LLMQ_TYPES.LLMQ_DEVNET_PLATFORM, 12, 8, 4],
  ];

  it('Should define the same LLMQ types as Dash Core', function () {
    var types = coreParams.map(function (params) {
      return String(params[0]);
    });
    expect(Object.keys(constants.LLMQ_TYPE_PARAMS)).to.have.members(types);
  });

  coreParams.forEach(function (params) {
    it('Should match Dash Core params for LLMQ type ' + params[0], function () {
      expect(constants.LLMQ_TYPE_PARAMS[params[0]]).to.be.deep.equal({
        size: params[1],
        threshold: params[2],
        maximumActiveQuorumsCount: params[3],
      });
    });
  });
});
