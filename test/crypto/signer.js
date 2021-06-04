/* eslint-disable */
var chai = require('chai');
var Signer = require('../../lib/crypto/signer');
var PrivateKey = require('../../lib/privatekey');
var PublicKey = require('../../lib/publickey');

var expect = chai.expect;

describe('HashSigner', function () {
  describe('sign', function () {
    var privateKeyString;
    var publicKeyString;
    var publicKey;

    beforeEach(function () {
      privateKeyString =
        '032f352abd3fb62c3c5b543bb6eae515a1b99a202b367ab9c6e155ba689d0ff4';
      publicKeyString =
        '02716899be7008396a0b34dd49d9707b01e86265f9556ab54a493e712d42946e7a';
      publicKey = new PublicKey(publicKeyString);
    });

    it('should sign and verify the data', function () {
      var data = Buffer.from('fafafa', 'hex');

      var signature = Signer.sign(data, privateKeyString);

      expect(signature).to.be.an.instanceOf(Buffer);

      var isVerified = Signer.verifySignature(data, signature, publicKey);

      expect(isVerified).to.be.true;
    });

    it('Signature should not be verifiable against different data', function () {
      var data = Buffer.from('fafafa', 'hex');
      var incorrectData = Buffer.from('fefefe', 'hex');

      var signature = Signer.sign(data, privateKeyString);
      var isVerified = Signer.verifySignature(
        incorrectData,
        signature,
        publicKey
      );

      expect(isVerified).to.be.false;
    });

    it('Signature should not be verifiable against different publicKeyId', function () {
      var data = Buffer.from('fafafa', 'hex');
      var incorrectPubKey = new PrivateKey().toPublicKey();

      var signature = Signer.sign(data, privateKeyString);
      var isVerified = Signer.verifySignature(data, signature, incorrectPubKey);

      expect(isVerified).to.be.false;
    });
  });
  describe('verifySignature', function () {
    var privateKey;
    var pkBuffer;
    var pkHex;
    var messageBuffer;
    var compactSig;
    var sig2;
    var sig3;
    var pubKey;
    var uncompressedPubKey;
    var compressedPubKey;

    beforeEach(function () {
      privateKey = new PrivateKey(
        '032f352abd3fb62c3c5b543bb6eae515a1b99a202b367ab9c6e155ba689d0ff4'
      );
      pkBuffer = privateKey.toBuffer();
      pkHex = privateKey.toString();
      messageBuffer = Buffer.from('Hello world!');
      compactSig = Signer.sign(messageBuffer, privateKey);
      sig2 = Signer.sign(messageBuffer, new PrivateKey(pkBuffer));
      sig3 = Signer.sign(messageBuffer, new PrivateKey(pkHex));
      pubKey = privateKey.toPublicKey();
      uncompressedPubKey = new PublicKey({
        x: pubKey.toObject().x,
        y: pubKey.toObject().y,
        compressed: false,
      });
      compressedPubKey = new PublicKey({
        x: pubKey.toObject().x,
        y: pubKey.toObject().y,
        compressed: true,
      });
    });

    it('should verify against signature with an uncompressed key', function () {
      expect(uncompressedPubKey.toObject().compressed).to.be.false;
      expect(uncompressedPubKey.toString().length).to.be.equal(130);

      var verified = Signer.verifySignature(
        messageBuffer,
        compactSig,
        uncompressedPubKey
      );
      expect(verified).to.be.true;
      verified = Signer.verifySignature(
        messageBuffer,
        sig2,
        uncompressedPubKey
      );
      expect(verified).to.be.true;
      verified = Signer.verifySignature(
        messageBuffer,
        sig3,
        uncompressedPubKey
      );
      expect(verified).to.be.true;
    });

    it('should verify against signature with a compressed key', function () {
      expect(compressedPubKey.toObject().compressed).to.be.true;
      expect(compressedPubKey.toString().length).to.be.equal(66);

      var verified = Signer.verifySignature(
        messageBuffer,
        compactSig,
        compressedPubKey
      );
      expect(verified).to.be.true;
      verified = Signer.verifySignature(messageBuffer, sig2, compressedPubKey);
      expect(verified).to.be.true;
      verified = Signer.verifySignature(messageBuffer, sig3, compressedPubKey);
      expect(verified).to.be.true;
    });

    it("shouldn't verify against another pubkey", function () {
      var differentPubKey = new PrivateKey().toPublicKey();

      var verified = Signer.verifySignature(
        messageBuffer,
        compactSig,
        differentPubKey
      );
      expect(verified).to.be.false;
    });
  });
});
