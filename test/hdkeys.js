/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

// Relax some linter options:
//   * quote marks so "m/0'/1/2'/" doesn't need to be scaped
//   * too many tests, maxstatements -> 100
//   * store test vectors at the end, latedef: false
//   * should call is never defined
/* jshint quotmark: false */
/* jshint latedef: false */
/* jshint maxstatements: 100 */
/* jshint unused: false */

var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var bitcore = require('../index.js');
var Networks = bitcore.Networks;
var HDPrivateKey = bitcore.HDPrivateKey;
var HDPublicKey = bitcore.HDPublicKey;

describe('HDKeys building with static methods', function () {
  var classes = [HDPublicKey, HDPrivateKey];
  var clazz, index;

  _.each(classes, function (clazz) {
    var expectStaticMethodFail = function (staticMethod, argument, message) {
      expect(clazz[staticMethod].bind(null, argument)).to.throw(message);
    };
    it(
      clazz.name + ' fromJSON checks that a valid JSON is provided',
      function () {
        var errorMessage = 'Invalid Argument: No valid argument was provided';
        var method = 'fromObject';
        expectStaticMethodFail(method, undefined, errorMessage);
        expectStaticMethodFail(method, null, errorMessage);
        expectStaticMethodFail(method, 'invalid JSON', errorMessage);
        expectStaticMethodFail(method, "{'singlequotes': true}", errorMessage);
      }
    );
    it(
      clazz.name + ' fromString checks that a string is provided',
      function () {
        var errorMessage = 'No valid string was provided';
        var method = 'fromString';
        expectStaticMethodFail(method, undefined, errorMessage);
        expectStaticMethodFail(method, null, errorMessage);
        expectStaticMethodFail(method, {}, errorMessage);
      }
    );
    it(
      clazz.name + ' fromObject checks that an object is provided',
      function () {
        var errorMessage = 'No valid argument was provided';
        var method = 'fromObject';
        expectStaticMethodFail(method, undefined, errorMessage);
        expectStaticMethodFail(method, null, errorMessage);
        expectStaticMethodFail(method, '', errorMessage);
      }
    );
  });
});

describe('BIP32 compliance', function () {
  it('should initialize test vector 1 from the extended public key', function () {
    new HDPublicKey(vector1_m_public).xpubkey.should.equal(vector1_m_public);
  });

  it('should initialize test vector 1 from the extended private key', function () {
    new HDPrivateKey(vector1_m_private).xprivkey.should.equal(
      vector1_m_private
    );
  });

  it('can initialize a public key from an extended private key', function () {
    new HDPublicKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it('toString should be equal to the `xpubkey` member', function () {
    var privateKey = new HDPrivateKey(vector1_m_private);
    privateKey.toString().should.equal(privateKey.xprivkey);
  });

  it('toString should be equal to the `xpubkey` member', function () {
    var publicKey = new HDPublicKey(vector1_m_public);
    publicKey.toString().should.equal(publicKey.xpubkey);
  });

  it('should get the extended public key from the extended private key for test vector 1', function () {
    HDPrivateKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it("should get m/0' ext. private key from test vector 1", function () {
    var privateKey = new HDPrivateKey(vector1_m_private).derive("m/0'");
    privateKey.xprivkey.should.equal(vector1_m0h_private);
  });

  it("should get m/0' ext. public key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'")
      .xpubkey.should.equal(vector1_m0h_public);
  });

  it("should get m/0'/1 ext. private key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1")
      .xprivkey.should.equal(vector1_m0h1_private);
  });

  it("should get m/0'/1 ext. public key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1")
      .xpubkey.should.equal(vector1_m0h1_public);
  });

  it("should get m/0'/1 ext. public key from m/0' public key from test vector 1", function () {
    var derivedPublic = HDPrivateKey(vector1_m_private)
      .derive("m/0'")
      .hdPublicKey.derive('m/1');
    derivedPublic.xpubkey.should.equal(vector1_m0h1_public);
  });

  it("should get m/0'/1/2' ext. private key from test vector 1", function () {
    var privateKey = new HDPrivateKey(vector1_m_private);
    var derived = privateKey.derive("m/0'/1/2'");
    derived.xprivkey.should.equal(vector1_m0h12h_private);
  });

  it("should get m/0'/1/2' ext. public key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1/2'")
      .xpubkey.should.equal(vector1_m0h12h_public);
  });

  it("should get m/0'/1/2'/2 ext. private key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1/2'/2")
      .xprivkey.should.equal(vector1_m0h12h2_private);
  });

  it("should get m/0'/1/2'/2 ext. public key from m/0'/1/2' public key from test vector 1", function () {
    var derived =
      HDPrivateKey(vector1_m_private).derive("m/0'/1/2'").hdPublicKey;
    derived.derive('m/2').xpubkey.should.equal(vector1_m0h12h2_public);
  });

  it("should get m/0'/1/2h/2 ext. public key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1/2'/2")
      .xpubkey.should.equal(vector1_m0h12h2_public);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. private key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1/2'/2/1000000000")
      .xprivkey.should.equal(vector1_m0h12h21000000000_private);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. public key from test vector 1", function () {
    HDPrivateKey(vector1_m_private)
      .derive("m/0'/1/2'/2/1000000000")
      .xpubkey.should.equal(vector1_m0h12h21000000000_public);
  });

  it("should get m/0'/1/2'/2/1000000000 ext. public key from m/0'/1/2'/2 public key from test vector 1", function () {
    var derived =
      HDPrivateKey(vector1_m_private).derive("m/0'/1/2'/2").hdPublicKey;
    derived
      .derive('m/1000000000')
      .xpubkey.should.equal(vector1_m0h12h21000000000_public);
  });

  it('should initialize test vector 2 from the extended public key', function () {
    HDPublicKey(vector2_m_public).xpubkey.should.equal(vector2_m_public);
  });

  it('should initialize test vector 2 from the extended private key', function () {
    HDPrivateKey(vector2_m_private).xprivkey.should.equal(vector2_m_private);
  });

  it('should get the extended public key from the extended private key for test vector 2', function () {
    HDPrivateKey(vector2_m_private).xpubkey.should.equal(vector2_m_public);
  });

  it('should get m/0 ext. private key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive(0)
      .xprivkey.should.equal(vector2_m0_private);
  });

  it('should get m/0 ext. public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive(0)
      .xpubkey.should.equal(vector2_m0_public);
  });

  it('should get m/0 ext. public key from m public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .hdPublicKey.derive(0)
      .xpubkey.should.equal(vector2_m0_public);
  });

  it('should get m/0/2147483647h ext. private key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'")
      .xprivkey.should.equal(vector2_m02147483647h_private);
  });

  it('should get m/0/2147483647h ext. public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'")
      .xpubkey.should.equal(vector2_m02147483647h_public);
  });

  it('should get m/0/2147483647h/1 ext. private key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1")
      .xprivkey.should.equal(vector2_m02147483647h1_private);
  });

  it('should get m/0/2147483647h/1 ext. public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1")
      .xpubkey.should.equal(vector2_m02147483647h1_public);
  });

  it('should get m/0/2147483647h/1 ext. public key from m/0/2147483647h public key from test vector 2', function () {
    var derived =
      HDPrivateKey(vector2_m_private).derive("m/0/2147483647'").hdPublicKey;
    derived.derive(1).xpubkey.should.equal(vector2_m02147483647h1_public);
  });

  it('should get m/0/2147483647h/1/2147483646h ext. private key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1/2147483646'")
      .xprivkey.should.equal(vector2_m02147483647h12147483646h_private);
  });

  it('should get m/0/2147483647h/1/2147483646h ext. public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1/2147483646'")
      .xpubkey.should.equal(vector2_m02147483647h12147483646h_public);
  });

  it('should get m/0/2147483647h/1/2147483646h/2 ext. private key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1/2147483646'/2")
      .xprivkey.should.equal(vector2_m02147483647h12147483646h2_private);
  });

  it('should get m/0/2147483647h/1/2147483646h/2 ext. public key from test vector 2', function () {
    HDPrivateKey(vector2_m_private)
      .derive("m/0/2147483647'/1/2147483646'/2")
      .xpubkey.should.equal(vector2_m02147483647h12147483646h2_public);
  });

  it('should get m/0/2147483647h/1/2147483646h/2 ext. public key from m/0/2147483647h/2147483646h public key from test vector 2', function () {
    var derivedPublic = HDPrivateKey(vector2_m_private).derive(
      "m/0/2147483647'/1/2147483646'"
    ).hdPublicKey;
    derivedPublic
      .derive('m/2')
      .xpubkey.should.equal(vector2_m02147483647h12147483646h2_public);
  });

  it('should use full 32 bytes for private key data that is hashed (as per bip32)', function () {
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    var privateKeyBuffer = Buffer.from(
      '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd',
      'hex'
    );
    var chainCodeBuffer = Buffer.from(
      '9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089',
      'hex'
    );
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    var derived = key.deriveChild("m/44'/0'/0'/0/0'");
    derived.privateKey
      .toString()
      .should.equal(
        '3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb'
      );
  });

  it('should NOT use full 32 bytes for private key data that is hashed with nonCompliant flag', function () {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = Buffer.from(
      '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd',
      'hex'
    );
    var chainCodeBuffer = Buffer.from(
      '9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089',
      'hex'
    );
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    var derived = key.deriveNonCompliantChild("m/44'/0'/0'/0/0'");
    derived.privateKey
      .toString()
      .should.equal(
        '4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836'
      );
  });

  it('should NOT use full 32 bytes for private key data that is hashed with the nonCompliant derive method', function () {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = Buffer.from(
      '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd',
      'hex'
    );
    var chainCodeBuffer = Buffer.from(
      '9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089',
      'hex'
    );
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    var derived = key.derive("m/44'/0'/0'/0/0'");
    derived.privateKey
      .toString()
      .should.equal(
        '4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836'
      );
  });

  describe('edge cases', function () {
    var sandbox = sinon.createSandbox();
    afterEach(function () {
      sandbox.restore();
    });
    it('will handle edge case that derived private key is invalid', function () {
      var invalid = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      );
      var privateKeyBuffer = Buffer.from(
        '5f72914c48581fc7ddeb944a9616389200a9560177d24f458258e5b04527bcd1',
        'hex'
      );
      var chainCodeBuffer = Buffer.from(
        '39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91',
        'hex'
      );
      var unstubbed = bitcore.crypto.BN.prototype.toBuffer;
      var count = 0;
      var stub = sandbox
        .stub(bitcore.crypto.BN.prototype, 'toBuffer')
        .callsFake(function (args) {
          // On the fourth call to the function give back an invalid private key
          // otherwise use the normal behavior.
          count++;
          if (count === 4) {
            return invalid;
          }
          var ret = unstubbed.apply(this, arguments);
          return ret;
        });
      sandbox.spy(bitcore.PrivateKey, 'isValid');
      var key = HDPrivateKey.fromObject({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        privateKey: privateKeyBuffer,
        chainCode: chainCodeBuffer,
      });
      var derived = key.derive("m/44'");
      derived.privateKey
        .toString()
        .should.equal(
          'b15bce3608d607ee3a49069197732c656bca942ee59f3e29b4d56914c1de6825'
        );
      bitcore.PrivateKey.isValid.callCount.should.equal(2);
    });
    it('will handle edge case that a derive public key is invalid', function () {
      var publicKeyBuffer = Buffer.from(
        '029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099',
        'hex'
      );
      var chainCodeBuffer = Buffer.from(
        '39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91',
        'hex'
      );
      var key = new HDPublicKey({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        chainCode: chainCodeBuffer,
        publicKey: publicKeyBuffer,
      });
      var unstubbed = bitcore.PublicKey.fromPoint;
      bitcore.PublicKey.fromPoint = function () {
        bitcore.PublicKey.fromPoint = unstubbed;
        throw new Error('Point cannot be equal to Infinity');
      };
      sandbox.spy(key, '_deriveWithNumber');
      var derived = key.derive('m/44');
      key._deriveWithNumber.callCount.should.equal(2);
      key.publicKey
        .toString()
        .should.equal(
          '029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099'
        );
    });
  });

  describe('seed', function () {
    it('should initialize a new BIP32 correctly from test vector 1 seed', function () {
      var seededKey = HDPrivateKey.fromSeed(vector1_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector1_m_private);
      seededKey.xpubkey.should.equal(vector1_m_public);
    });

    it('should initialize a new BIP32 correctly from test vector 2 seed', function () {
      var seededKey = HDPrivateKey.fromSeed(vector2_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector2_m_private);
      seededKey.xpubkey.should.equal(vector2_m_public);
    });
  });
  
  describe('DIP14 256-bit compliance', function() {

    it('should derive an arbitrary DIP14 256-bit path correctly from a seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_1_m77).privateKey.toString('hex').should.equal(vector3_dip14_path_1_m77_private);
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h).privateKey.toString('hex').should.equal(vector3_dip14_path_1_m77_f5h_private);
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h_4c_0).privateKey.toString('hex').should.equal(vector3_dip14_path_1_m77_f5h_4c_0_private);
    });

    it('should serialize an arbitrary DIP14 256-bit xpubkey and xprivkey correctly', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h_4c_0).xprivkey.should.equal(vector3_dip14_path_1_m77_f5h_4c_0_xprivkey);
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h_4c_0).xpubkey.should.equal(vector3_dip14_path_1_m77_f5h_4c_0_xpubkey);
    });
    
    it('should return the same publicKey for non-hardened derivation from HDPrivateKey and HDPublicKey', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_1_m77).publicKey.toString().should.equal(vector3_dip14_path_1_m77_public)
      seededKey.hdPublicKey.deriveChild(vector3_dip14_path_1_m77).publicKey.toString().should.equal(vector3_dip14_path_1_m77_public)
    });
    
    it('should serialize the same xpubkey non-hardened derivation from HDPrivateKey and HDPublicKey', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_1_m77).xpubkey.toString().should.equal(vector3_dip14_path_1_m77_xpubkey)
      seededKey.hdPublicKey.deriveChild(vector3_dip14_path_1_m77).xpubkey.toString().should.equal(vector3_dip14_path_1_m77_xpubkey)
    });

    it('should serialize 256-bit xpubkey and xprivkeys correctly for hardened and non-hardened derivations', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_1_m77).xprivkey.should.equal(vector3_dip14_path_1_m77_xprivkey)
      seededKey.deriveChild(vector3_dip14_path_1_m77).xpubkey.should.equal(vector3_dip14_path_1_m77_xpubkey)
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h).xprivkey.should.equal(vector3_dip14_path_1_m77_f5h_xprivkey)
      seededKey.deriveChild(vector3_dip14_path_1_m77_f5h).xpubkey.should.equal(vector3_dip14_path_1_m77_f5h_xpubkey)
    });
    
    it('should derive a Dashpay DIP14 256-bit path correctly from a seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_2).privateKey.toString('hex').should.equal(vector3_dip14_path_2_private);
    });
    
    it('should serialize a Dashpay DIP14 256-bit xpubkey and xprivkey correctly', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      seededKey.deriveChild(vector3_dip14_path_2).xprivkey.should.equal(vector3_dip14_path_2_xprivkey);
      seededKey.deriveChild(vector3_dip14_path_2).xpubkey.should.equal(vector3_dip14_path_2_xpubkey);
    });
    
    it('should derive a BIP32 path from hex correctly', function() {
      var seededKey = HDPrivateKey.fromSeed(vector3_dip14_master, Networks.testnet);
      var child = seededKey.deriveChild(vector3_bip32)
      var childHex = seededKey.deriveChild(vector3_bip32_hex)
      child.privateKey.toString('hex').should.equal(childHex.privateKey.toString('hex'))
      childHex.privateKey.toString('hex').should.equal(vector3_bip32_private)
    });

  });
});

//test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
var vector1_master = '000102030405060708090a0b0c0d0e0f';
var vector1_m_public = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
var vector1_m_private = 'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi';
var vector1_m0h_public = 'xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw';
var vector1_m0h_private = 'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7';
var vector1_m0h1_public = 'xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ';
var vector1_m0h1_private = 'xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs';
var vector1_m0h12h_public = 'xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5';
var vector1_m0h12h_private = 'xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM';
var vector1_m0h12h2_public = 'xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV';
var vector1_m0h12h2_private = 'xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334';
var vector1_m0h12h21000000000_public = 'xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy';
var vector1_m0h12h21000000000_private = 'xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76';
var vector2_master = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
var vector2_m_public = 'xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB';
var vector2_m_private = 'xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U';
var vector2_m0_public = 'xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH';
var vector2_m0_private = 'xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt';
var vector2_m02147483647h_public = 'xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBrQSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a';
var vector2_m02147483647h_private = 'xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9';
var vector2_m02147483647h1_public = 'xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon';
var vector2_m02147483647h1_private = 'xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef';
var vector2_m02147483647h12147483646h_public = 'xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL';
var vector2_m02147483647h12147483646h_private = 'xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njGVyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc';
var vector2_m02147483647h12147483646h2_public = 'xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt';
var vector2_m02147483647h12147483646h2_private = 'xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j';

//test vectors: https://github.com/dashpay/dips/blob/master/dip-0014.md#test-vectors
var vector3_dip14_master = 'b16d3782e714da7c55a397d5f19104cfed7ffa8036ac514509bbb50807f8ac598eeb26f0797bd8cc221a6cbff2168d90a5e9ee025a5bd977977b9eccd97894bb';
var vector3_dip14_path_1_m77 = "m/0x775d3854c910b7dee436869c4724bed2fe0784e198b8a39f02bbb49d8ebcfc3b"
var vector3_dip14_path_1_m77_public = "03a2d1bbd1511e2bad8ed6292e949a97b42c29ce2438e39c93c46df2d283135ad3"
var vector3_dip14_path_1_m77_private = "f6a95ae75ea8362d9478932f71b262b3d981918fe030316686a475dea4889938"
var vector3_dip14_path_1_m77_xpubkey = "dptp1C5gGd8NzvAke5WNKyRfpDRyvV2UZ3jjrZVZU77qk9yZemMGSdZpkWp7y6wt3FzvFxAHSW8VMCaC1p6Ny5EqWuRm2sjvZLUUFMMwXhmW6eS69qjX958RYBH5R8bUCGZkCfUyQ8UVWcx9katkrRr"
var vector3_dip14_path_1_m77_xprivkey = "dpts1vgMVEs9mmv1YLwURCeoTn9CFMZ8JMVhyZuxQSKttNSETR3zydMFHMKTTNDQPf6nnupCCtcNnSu3nKZXAJhaguyoJWD4Ju5PE6PSkBqAKWci7HLz37qmFmZZU6GMkLvNLtST2iV8NmqqbX37c45"

var vector3_dip14_path_1_m77_f5h = "m/0x775d3854c910b7dee436869c4724bed2fe0784e198b8a39f02bbb49d8ebcfc3b/0xf537439f36d04a15474ff7423e4b904a14373fafb37a41db74c84f1dbb5c89a6'"
var vector3_dip14_path_1_m77_f5h_private = "b898ad92d3a0698bc3117d3777d82676673816ce52f4fc2f1263a2f676825f90"
var vector3_dip14_path_1_m77_f5h_xpubkey = "dptp1CLkexeadp6guoi8Fbiwq6CLZm3hT1DJLwHsxWvwYSeAhjenFhcQ9HumZSftfZEr4dyQjFD7gkM5bSn6Aj7F1Jve8KTn4JsMEaj9dFyJkYs4Ga5HSUqeajxGVmzaY1pEioDmvUtZL3J1NCDCmzQ"
var vector3_dip14_path_1_m77_f5h_xprivkey = "dpts1vwRsaPMQfqwp59ELpx5UeuYtdaMCJyGTwiGtr8zgf6qWPMWnhPpg8R73hwR1xLibbdKVdh17zfwMxFEMxZzBKUgPwvuosUGDKW4ayZjs3AQB9EGRcVpDoFT8V6nkcc6KzksmZxvmDcd3MqiPEu"

var vector3_dip14_path_1_m77_f5h_4c_0 = "m/0x775d3854c910b7dee436869c4724bed2fe0784e198b8a39f02bbb49d8ebcfc3b/0xf537439f36d04a15474ff7423e4b904a14373fafb37a41db74c84f1dbb5c89a6'/0x4c4592ca670c983fc43397dfd21a6f427fac9b4ac53cb4dcdc6522ec51e81e79/0"
var vector3_dip14_path_1_m77_f5h_4c_0_private= "e8781fdef72862968cd9a4d2df34edaf9dcc5b17629ec505f0d2d1a8ed6f9f09"
var vector3_dip14_path_1_m77_f5h_4c_0_xprivkey = "tprv8iNr6Z8PgAHmYSgMKGbq42kMVAAQmwmzm5iTJdUXoxLf25zG3GeRCvnEdC6HKTHkU59nZkfjvcGk9VW2YHsFQMwsZrQLyNrGx9c37kgb368"
var vector3_dip14_path_1_m77_f5h_4c_0_xpubkey = "tpubDF4tEyAdpXySRui9CvGRTSQU4BgLwGxuLPKEb9WqEE93raF2ffU1PRQ6oJHCgZ7dArzcMj9iKG8s8EFA1DdwgzWAXs61uFuRE1bQi8kAmLy"

var vector3_dip14_path_2 = "m/9'/5'/15'/0'/0x555d3854c910b7dee436869c4724bed2fe0784e198b8a39f02bbb49d8ebcfc3a'/0xa137439f36d04a15474ff7423e4b904a14373fafb37a41db74c84f1dbb5c89b5'/0"
var vector3_dip14_path_2_private= "fac40790776d171ee1db90899b5eb2df2f7d2aaf35ad56f07ffb8ed2c57f8e60"
var vector3_dip14_path_2_xprivkey = "tprv8p9LqE2tA2b94gc3ciRNA525WVkFvzkcC9qjpKEcGaTqjb9u2pwTXj41KkZTj3c1a6fJUpyXRfcB4dimsYsLMjQjsTJwi5Ukx6tJ5BpmYpx"
var vector3_dip14_path_2_xpubkey = "tpubDLqNye58JQGox9dqWN5xZUgC5XGC6KwWmTSX6qGugrGEa5QffDm3iDfsVtX7qyXuWoQsXA6YCSuckKshyjnwiGGoYWHonAv2X98HTU613UH"

var vector3_bip32 ="m/1/2/3/255"
var vector3_bip32_hex = "m/0x01/0x02/0x03/0xFF"
var vector3_bip32_private ="610c2ef3000e75ec04e78b4d9b016aad3e275bf17edb30087d6fa1299938cf0d"
