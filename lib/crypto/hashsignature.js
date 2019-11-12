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
function signData(data, privateKey) {
  var hash = doubleSha(data);
  return signHash(hash, privateKey);
}

/**
 * @param {Buffer} data
 * @param {Buffer} signature
 * @param {Buffer|string} publicKeyId
 * @return {boolean}
 */
function verifyDataSignature(data, signature, publicKeyId) {
  var dataHash = doubleSha(data);
  var signatureBuffer = Buffer.from(signature, 'hex');
  return verifySignature(dataHash, signatureBuffer, publicKeyId);
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
function verifySignature(hash, dataSignature, publicKeyId) {
  var signature = Signature.fromCompact(dataSignature);
  var extractedPublicKey = new ECDSA({
    hashbuf: hash,
    sig: signature
  }).toPublicKey();
  var extractedPubKeyId = extractedPublicKey._getID();
  var pubKeyId = Buffer.from(publicKeyId, 'hex');

  return extractedPubKeyId.equals(pubKeyId);
}

var hashSignature = {
  signData: signData,
  verifyDataSignature: verifyDataSignature,
  signHash: signHash,
  verifySignature: verifySignature
};

module.exports = hashSignature;
