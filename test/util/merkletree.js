/* eslint-disable */
var expect = require('chai').expect;
var merkleTreeUtil = require('../../lib/util/merkletree');
var getMerkleTree = merkleTreeUtil.getMerkleTree;
var getMerkleRoot = merkleTreeUtil.getMerkleRoot;
var calculateTreeWidth = merkleTreeUtil.calculateTreeWidth;
var calculateHashAtHeight = merkleTreeUtil.calculateHashAtHeight;

var hashes = [
  Buffer.from('6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 'hex'),
  Buffer.from('bf7e815688420059a4a77c66ad8d154487a25f3fcee73e36514f66fbc26ae91a', 'hex'),
  Buffer.from('18083d9866ba7fde28e819520ff4a4e9a7c871fe7929d997c84aebe7ae8b9385', 'hex')
];

var expectedTree = [
  Buffer.from('6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 'hex'),
  Buffer.from('bf7e815688420059a4a77c66ad8d154487a25f3fcee73e36514f66fbc26ae91a', 'hex'),
  Buffer.from('18083d9866ba7fde28e819520ff4a4e9a7c871fe7929d997c84aebe7ae8b9385', 'hex'),
  Buffer.from('509051b275340cb2c5bf784764c4ca4505a2d96178e8166523145ce496dd1c24', 'hex'),
  Buffer.from('30b07f4b48fac0ff36f1ba88198267392d4b684db4eb8dff313722c86fab17e4', 'hex'),
  Buffer.from('f7be256fbaef5f3f5eb1d0807852a396314c11a964848b57e6a38b8e82c8777b', 'hex')
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
    it('Should calculate tree width properly', function () {
      var width = calculateTreeWidth(3, 0);
      expect(width).to.be.equal(3);
      width = calculateTreeWidth(3, 1);
      expect(width).to.be.equal(2);
      width = calculateTreeWidth(3, 2);
      expect(width).to.be.equal(1);
      width = calculateTreeWidth(10, 0);
      expect(width).to.be.equal(10);
      width = calculateTreeWidth(10, 1);
      expect(width).to.be.equal(5);
      width = calculateTreeWidth(10, 2);
      expect(width).to.be.equal(3);
      width = calculateTreeWidth(10, 3);
      expect(width).to.be.equal(2);
      width = calculateTreeWidth(10, 4);
      expect(width).to.be.equal(1);
    });
  });
  describe('calculateHashAtHeight', function () {
    it('Should calculate hash at height', function () {
      // Here we have 6 hashes, meaning that tree on the level 0 will have 6 hashes,
      // 3 on the level 1, 2 on the level 2, and 1 on the level 3.
      // This means, that 0 hash on the level 1 should be equal to hash of the first two
      // hashes on the level 0, meaning:
      // 23dbf3cce3a67c80aca61592b210ea63191b8fe3ad0368583016d8a6622bdf4f =
      // hash(bf3ae3deccfdee0ebf03fc924aea3dad4b1068acdd27e98d9e6cc9a140e589d1 +
      // 9ecb5c68a93c51e8db403f97b83a910edf0878c70b7d7ee02422c0f7c7c9885f);
      var hashes = [
        'bf3ae3deccfdee0ebf03fc924aea3dad4b1068acdd27e98d9e6cc9a140e589d1',
        '9ecb5c68a93c51e8db403f97b83a910edf0878c70b7d7ee02422c0f7c7c9885f',
        'e1d496484925f015078d6269e2e9ed28698f9d5f609da930d6e8ce50e07c2e22',
        '27306aa8c486a38f1afcc2a077f4cd09643065c3c7fa487e0b36383b30184de7',
        'f2f8af2e212a3db4b88dc59b2271f9600376d126bf17d4f3c413cf22586c3457',
        '0fe0981234cf8077f113327052876bd9f997965f9012b0723dd891903a27f7a1'
      ].map(function (hash) { return Buffer.from(hash, 'hex'); });
      var expectedLevel1 = [
        '23dbf3cce3a67c80aca61592b210ea63191b8fe3ad0368583016d8a6622bdf4f',
        'deb86b0ba69692110bfd4d932597b1957dd09d42325e898d45f4eea36338dd00',
        'f5b3ac9195d345e1d7a88a7ee21a7b98b2c20c59d086575d839c24a36171469f'
      ];
      // Not that because level1 has odd count of nodes, the last element of the next level
      // will be the hash of the last element concatenated with itself, meaning:
      // 551dab9393d103b5024f1fc0a08a3d34f12456560910c8f1a7223e92e8a5e860 =
      // hash(f5b3ac9195d345e1d7a88a7ee21a7b98b2c20c59d086575d839c24a36171469f +
      // f5b3ac9195d345e1d7a88a7ee21a7b98b2c20c59d086575d839c24a36171469f);
      var expectedLevel2 = [
        '7adb5cef319d9355e98505676d52f52590cfc2218dc3994afa617e067920ab05',
        '551dab9393d103b5024f1fc0a08a3d34f12456560910c8f1a7223e92e8a5e860'
      ];
      var expectedRoot = 'b431c3eb9f7072910e2a7b9e33c45ea12ecc33647eb25c4c69cf24af93e0d589';

      var height1position0hash = calculateHashAtHeight(hashes.length, 1, 0, hashes).toString('hex');
      expect(height1position0hash).to.be.equal(expectedLevel1[0]);
      var height2position2hash = calculateHashAtHeight(hashes.length, 2, 1, hashes).toString('hex');
      expect(height2position2hash).to.be.equal(expectedLevel2[1]);
      var actualRoot = calculateHashAtHeight(hashes.length, 3, 0, hashes).toString('hex');
      expect(actualRoot).to.be.equal(expectedRoot);
    });
  });
});
