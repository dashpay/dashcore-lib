/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Signature = require('./signature');
var ECDSA = require('./ecdsa');
var PrivateKey = require('../privatekey');
var doubleSha = require('./hash').sha256sha256;

/**
 * @param {Buffer} data
 * @param {string|PrivateKey} privateKey
 * @return {Buffer}
 */
function sign(data, privateKey) {
  var hash = doubleSha(data);
  return signHash(hash, privateKey);
}

/**
 * Sign hash.
 * @param {Buffer} hash
 * @param {string|PrivateKey} privateKey
 * @return {Buffer} - 65-bit compact signature
 */
function signHash(hash, privateKey) {
  if (typeof privateKey === 'string') {
    privateKey = new PrivateKey(privateKey);
  }
  var ecdsa = new ECDSA();
  ecdsa.hashbuf = hash;
  ecdsa.privkey = privateKey;
  ecdsa.pubkey = privateKey.toPublicKey();
  ecdsa.signRandomK();
  ecdsa.calci();
  return ecdsa.sig.toCompact();
}

/**
 * Verifies hash signature against public key id
 * @param {Buffer} hash
 * @param {Buffer} dataSignature
 * @param {Buffer|string} publicKeyId
 * @return {boolean}
 */
function verifyHashSignature(hash, dataSignature, publicKeyId) {
  var signature = Signature.fromCompact(dataSignature);
  var extractedPublicKey = new ECDSA({
    hashbuf: hash,
    sig: signature,
  }).toPublicKey();
  var extractedPubKeyId = extractedPublicKey._getID();
  var pubKeyId = Buffer.from(publicKeyId, 'hex');

  return extractedPubKeyId.equals(pubKeyId);
}

/**
 * @param {Buffer} data
 * @param {Buffer} dataSignature - compact signature
 * @param {PublicKey} publicKey
 * @return {boolean}
 */
function verifyDataSignature(data, dataSignature, publicKey) {
  var hash = doubleSha(data);
  var signature = Signature.fromCompact(dataSignature);

  return ECDSA.verify(hash, signature, publicKey);
}

var signer = {
  sign: sign,
  verifySignature: verifyDataSignature,
  signHash: signHash,
  verifyHashSignature: verifyHashSignature,
};

module.exports = signer;
