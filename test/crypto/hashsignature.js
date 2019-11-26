/* eslint-disable */
var chai = require('chai');
var HashSigner = require('../../lib/crypto/hashsignature');
var PrivateKey = require('../../lib/privatekey');
var PublicKey = require('../../lib/publickey');

var expect = chai.expect;

var privateKeyString = '032f352abd3fb62c3c5b543bb6eae515a1b99a202b367ab9c6e155ba689d0ff4';
var publicKeyString = '02716899be7008396a0b34dd49d9707b01e86265f9556ab54a493e712d42946e7a';
var pubKeyId = new PublicKey(publicKeyString)._getID();

describe('HashSigner', function() {
  describe('signData', function () {
    it('Should sign and verify the data', function () {
      var data = Buffer.from('fafafa', 'hex');

      var signature = HashSigner.signData(data, privateKeyString);

      expect(signature).to.be.an.instanceOf(Buffer);

      var isVerified = HashSigner.verifyDataSignature(data, signature, pubKeyId);

      expect(isVerified).to.be.true;
    });

    it('Signature should not be verifiable against different data', function () {
      var data = Buffer.from('fafafa', 'hex');
      var incorrectData = Buffer.from('fefefe', 'hex');

      var signature = HashSigner.signData(data, privateKeyString);
      var isVerified = HashSigner.verifyDataSignature(incorrectData, signature, pubKeyId);

      expect(isVerified).to.be.false;
    });

    it('Signature should not be verifiable against different publicKeyId', function () {
      var data = Buffer.from('fafafa', 'hex');
      var incorrectPubKeyId = new PrivateKey().publicKey._getID();

      var signature = HashSigner.signData(data, privateKeyString);
      var isVerified = HashSigner.verifyDataSignature(data, signature, incorrectPubKeyId);

      expect(isVerified).to.be.false;
    });
  });
  describe('verifyDataSignatureWithPubKey', function() {
    var privateKey = new PrivateKey();
    var messageBuffer = Buffer.from("Hello world!");
    var compactSig = HashSigner.signData(messageBuffer, privateKey);
    var pubKey = privateKey.toPublicKey();
    var uncompressedPubKey = new PublicKey({
      x: pubKey.toObject().x,
      y: pubKey.toObject().y,
      compressed: false
    });
    var compressedPubKey = new PublicKey({
      x: pubKey.toObject().x,
      y: pubKey.toObject().y,
      compressed: true
    });

    it('Should verify against signature done by uncompressed key', function () {
      expect(uncompressedPubKey.toObject().compressed).to.be.false;
      expect(uncompressedPubKey.toString().length).to.be.equal(130);

      var verified = HashSigner.verifyDataSignatureWithPubKey(messageBuffer, compactSig, uncompressedPubKey);
      expect(verified).to.be.true;
    });

    it('Should verify against signature done by compressed key', function () {
      expect(compressedPubKey.toObject().compressed).to.be.true;
      expect(compressedPubKey.toString().length).to.be.equal(66);

      var verified = HashSigner.verifyDataSignatureWithPubKey(messageBuffer, compactSig, compressedPubKey);
      expect(verified).to.be.true;
    });

    it("Shouldn't verify against another pubkey", function () {
      var differentPubKey = new PrivateKey().toPublicKey();

      var verified = HashSigner.verifyDataSignatureWithPubKey(messageBuffer, compactSig, differentPubKey);
      expect(verified).to.be.false;
    });

  });
});
