const DashcoreLib = require('../..');

const N = DashcoreLib.crypto.Point.getN();

/**
 * The high-S malleation of a compact signature: s' = N - s with the recovery id flipped.
 * It recovers the same key, but Core rejects it as non-canonical.
 * @param {string} sigHex
 * @return {string}
 */
function highS(sigHex) {
  const sig = Buffer.from(sigHex, 'hex');
  const compressed = sig[0] >= 31 ? 4 : 0;
  const recoveryId = (sig[0] - 27) % 4;
  const flippedId = recoveryId % 2 === 0 ? recoveryId + 1 : recoveryId - 1;
  const s = N.sub(new DashcoreLib.crypto.BN(sig.slice(33)));
  return Buffer.concat([
    Buffer.from([27 + compressed + flippedId]),
    sig.slice(1, 33),
    s.toArrayLike(Buffer, 'be', 32),
  ]).toString('hex');
}

/**
 * A compact signature whose recovery header is outside 27..34
 * @param {string} sigHex
 * @return {string}
 */
function badHeader(sigHex) {
  const sig = Buffer.from(sigHex, 'hex');
  sig[0] += 8;
  return sig.toString('hex');
}

module.exports = { highS, badHeader };
