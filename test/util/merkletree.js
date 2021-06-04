/* eslint-disable */
var expect = require('chai').expect;
var merkleTreeUtil = require('../../lib/util/merkletree');
var getMerkleTree = merkleTreeUtil.getMerkleTree;
var getMerkleRoot = merkleTreeUtil.getMerkleRoot;
var calculateTreeWidth = merkleTreeUtil.calculateTreeWidth;
var calculateHashAtHeight = merkleTreeUtil.calculateHashAtHeight;

var hashes = [
  Buffer.from(
    '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    'hex'
  ),
  Buffer.from(
    'bf7e815688420059a4a77c66ad8d154487a25f3fcee73e36514f66fbc26ae91a',
    'hex'
  ),
  Buffer.from(
    '18083d9866ba7fde28e819520ff4a4e9a7c871fe7929d997c84aebe7ae8b9385',
    'hex'
  ),
];

var expectedTree = [
  Buffer.from(
    '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    'hex'
  ),
  Buffer.from(
    'bf7e815688420059a4a77c66ad8d154487a25f3fcee73e36514f66fbc26ae91a',
    'hex'
  ),
  Buffer.from(
    '18083d9866ba7fde28e819520ff4a4e9a7c871fe7929d997c84aebe7ae8b9385',
    'hex'
  ),
  Buffer.from(
    '509051b275340cb2c5bf784764c4ca4505a2d96178e8166523145ce496dd1c24',
    'hex'
  ),
  Buffer.from(
    '30b07f4b48fac0ff36f1ba88198267392d4b684db4eb8dff313722c86fab17e4',
    'hex'
  ),
  Buffer.from(
    'f7be256fbaef5f3f5eb1d0807852a396314c11a964848b57e6a38b8e82c8777b',
    'hex'
  ),
];

describe('merkleTree', function () {
  describe('getMerkleTree', function () {
    it('should build a proper merkle tree', function () {
      var tree = getMerkleTree(hashes);

      expect(tree).to.be.an('array');
      // Three leaves, two nodes and a root, 6 in total
      expect(tree.length).to.be.equal(6);
      tree.forEach(function (node, index) {
        expect(node).to.be.instanceOf(Buffer);
        // sha256 is 32 bytes
        expect(node.length).to.be.equal(32);
        expect(node).to.be.deep.equal(expectedTree[index]);
      });
    });
  });
  describe('getMerkleRoot', function () {
    it('should return a copy of merkle root from merkle tree', function () {
      var tree = getMerkleTree(hashes);
      var root = getMerkleRoot(tree);

      // Last element of the tree is root
      expect(root).to.be.deep.equal(expectedTree[5]);

      // Test that resulted buffer is decoupled from the tree
      root.reverse();
      expect(root).to.be.not.deep.equal(expectedTree[5]);
    });
    it('should return undefined if tree is empty', function () {
      var root = getMerkleRoot([]);

      expect(root).to.be.undefined;
    });
  });
  describe('calculateTreeWidth', function () {
    var calculateTreeWidthTestCases = [
      { elementsCount: 10, height: 0, expectedWidth: 10 },
      { elementsCount: 10, height: 1, expectedWidth: 5 },
      { elementsCount: 10, height: 2, expectedWidth: 3 },
      { elementsCount: 10, height: 3, expectedWidth: 2 },
      { elementsCount: 10, height: 4, expectedWidth: 1 },
      { elementsCount: 10, height: 5, expectedWidth: 1 },
      { elementsCount: 10, height: 6, expectedWidth: 1 },
    ];
    calculateTreeWidthTestCases.forEach(function (args) {
      var testCaseName =
        'For tree with ' +
        args.elementsCount +
        ' elements, width at height ' +
        args.height +
        ' should be equal to ' +
        args.expectedWidth;
      it(testCaseName, function () {
        var width = calculateTreeWidth(args.elementsCount, args.height);
        expect(width).to.be.equal(args.expectedWidth);
      });
    });
  });
  describe('calculateHashAtHeight', function () {
    it('Should calculate hash at height', function () {
      // Here we have 6 hashes, meaning that tree on the level 0 will have 6 hashes,
      // 3 on the level 1, 2 on the level 2, and 1 on the level 3.
      // This means, that 0 hash on the level 1 should be equal to hash of the first two
      // hashes on the level 0, meaning:
      // 5f616a1319f9d10fc444a5fabd3fc4e60161f5b63471bdddeca1e8a25b833db2 =
      // hash(reverse(bf3ae3deccfdee0ebf03fc924aea3dad4b1068acdd27e98d9e6cc9a140e589d1) +
      // reverse(9ecb5c68a93c51e8db403f97b83a910edf0878c70b7d7ee02422c0f7c7c9885f));
      //
      // Note: Original bitcoin's core has a very strange merkle algorithm, where all
      // hashes always get reversed, so result would be a little bit different from
      // what may be expected
      var hashes = [
        'bf3ae3deccfdee0ebf03fc924aea3dad4b1068acdd27e98d9e6cc9a140e589d1',
        '9ecb5c68a93c51e8db403f97b83a910edf0878c70b7d7ee02422c0f7c7c9885f',
        'e1d496484925f015078d6269e2e9ed28698f9d5f609da930d6e8ce50e07c2e22',
        '27306aa8c486a38f1afcc2a077f4cd09643065c3c7fa487e0b36383b30184de7',
        'f2f8af2e212a3db4b88dc59b2271f9600376d126bf17d4f3c413cf22586c3457',
        '0fe0981234cf8077f113327052876bd9f997965f9012b0723dd891903a27f7a1',
      ].map(function (hash) {
        return Buffer.from(hash, 'hex');
      });

      var height1position0hash = calculateHashAtHeight(1, 0, hashes).toString(
        'hex'
      );
      expect(height1position0hash).to.be.equal(
        '5f616a1319f9d10fc444a5fabd3fc4e60161f5b63471bdddeca1e8a25b833db2'
      );
      var height2position2hash = calculateHashAtHeight(2, 1, hashes).toString(
        'hex'
      );
      expect(height2position2hash).to.be.equal(
        '82734783f7f853307a856f23566c1907d734905aa8021c6621e46c2fc810e0dc'
      );
      var actualRoot = calculateHashAtHeight(3, 0, hashes).toString('hex');
      expect(actualRoot).to.be.equal(
        '5e91c568f9812b9efbaf33c9ceceb32b1f947ef7e749e73e698257a77acb963e'
      );
    });
  });
});
