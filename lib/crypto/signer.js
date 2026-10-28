/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Signature = require('./signature');
var ECDSA = require('./ecdsa');
var BN = require('./bn');
var Point = require('./point');
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
 * Verifies hash signature against public key id, accepting only the canonical
 * encoding Core's CHashSigner::VerifyHashCanonical accepts: 65 bytes, a
 * recovery header of 27..34 and low S. Returns false instead of throwing.
 * @param {Buffer} hash
 * @param {Buffer} dataSignature - compact signature
 * @param {Buffer|string} publicKeyId
 * @return {boolean}
 */
function verifyHashSignatureCanonical(hash, dataSignature, publicKeyId) {
  if (
    dataSignature.length !== 65 ||
    dataSignature[0] < 27 ||
    dataSignature[0] > 34
  ) {
    return false;
  }
  var pubKeyId = Buffer.from(publicKeyId, 'hex');
  var extractedPubKeyId;
  try {
    var signature = Signature.fromCompact(dataSignature);
    // Core's compact parser rejects R >= N, and its recovery fails for R = 0;
    // our recovery would accept an unreduced R and recover the same key
    if (
      signature.r.lt(new BN(1)) ||
      signature.r.gte(Point.getN()) ||
      !signature.hasLowS()
    ) {
      return false;
    }
    extractedPubKeyId = new ECDSA({
      hashbuf: hash,
      sig: signature,
    })
      .toPublicKey()
      ._getID();
  } catch (e) {
    // Core returns false when no public key can be recovered
    return false;
  }
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
  verifyHashSignatureCanonical: verifyHashSignatureCanonical,
};

module.exports = signer;
