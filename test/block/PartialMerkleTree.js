/* eslint-disable */
var expect = require('chai').expect;
var PartialMerkleTree = require('../../lib/block/PartialMerkleTree');

describe('PartialMerkleTree', function () {
  describe('.build', function () {
    var testCases = [
      // Case 1
      {
        transactionHashes: [
          '7622a8766251223eecf7820bbb116f4889c48cc9942d08f4687033e8f59431ab',
          '94a469e14ef925159b1154081ace607c7b0f4d342d3e62c5fef0d3ce56dbe7d4',
          'a13000f587c512c01bc53f844966b5c72622098031431eb919e2b82507215391',
          '3f3517ee8fa95621fe8abdd81c1e0dfb50e21dd4c5a3c01eee2c47cf664821b6',
          '7262476912a96b9a6226cfa3a8f231ba3e2b1f75c396e88367e532c79c43c95b',
        ].map(function (hash) {
          return Buffer.from(hash, 'hex');
        }),
        matches: [true, false, false, false, false],
        expectedPartialTree: {
          totalTransactions: 5,
          merkleHashes: [
            '7622a8766251223eecf7820bbb116f4889c48cc9942d08f4687033e8f59431ab',
            '94a469e14ef925159b1154081ace607c7b0f4d342d3e62c5fef0d3ce56dbe7d4',
            '068955aa8cc65eddcf45b5a9730d519c88d77c8086afee5466399521a5514127',
            'dae7a1a0bdd565c2d36f1c0704e5a8d70c94c1ed203de74131550a283fb9436c',
          ],
          merkleFlags: [15],
        },
      },
      // Case 2
      {
        transactionHashes: [
          '7622a8766251223eecf7820bbb116f4889c48cc9942d08f4687033e8f59431ab',
          '94a469e14ef925159b1154081ace607c7b0f4d342d3e62c5fef0d3ce56dbe7d4',
          'a13000f587c512c01bc53f844966b5c72622098031431eb919e2b82507215391',
          '3f3517ee8fa95621fe8abdd81c1e0dfb50e21dd4c5a3c01eee2c47cf664821b6',
          '7262476912a96b9a6226cfa3a8f231ba3e2b1f75c396e88367e532c79c43c95b',
        ].map(function (hash) {
          return Buffer.from(hash, 'hex');
        }),
        matches: [true, false, true, false, true],
        expectedPartialTree: {
          totalTransactions: 5,
          merkleHashes: [
            '7622a8766251223eecf7820bbb116f4889c48cc9942d08f4687033e8f59431ab',
            '94a469e14ef925159b1154081ace607c7b0f4d342d3e62c5fef0d3ce56dbe7d4',
            'a13000f587c512c01bc53f844966b5c72622098031431eb919e2b82507215391',
            '3f3517ee8fa95621fe8abdd81c1e0dfb50e21dd4c5a3c01eee2c47cf664821b6',
            '7262476912a96b9a6226cfa3a8f231ba3e2b1f75c396e88367e532c79c43c95b',
          ],
          merkleFlags: [111, 7],
        },
      },
    ];

    testCases.forEach(function (testCase, index) {
      it(
        'Should construct the same partial merkle tree as dashcore, case #' +
          (index + 1),
        function () {
          var partialTree = new PartialMerkleTree({
            transactionHashes: testCase.transactionHashes,
            filterMatches: testCase.matches,
          });

          expect(partialTree.totalTransactions).to.be.equal(
            testCase.expectedPartialTree.totalTransactions
          );
          expect(partialTree.merkleHashes).to.be.deep.equal(
            testCase.expectedPartialTree.merkleHashes
          );
          expect(partialTree.merkleFlags).to.be.deep.equal(
            testCase.expectedPartialTree.merkleFlags
          );
        }
      );
    });
  });
});
