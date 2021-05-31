/**
 * @param r
 * @param s
 * @returns {Signature}
 * @constructor
 */
export class Signature {
  constructor(r: any, s: any);

  /**
   * In order to mimic the non-strict DER encoding of OpenSSL, set strict = false.
   */
  static parseDER(): void;

  /**
   * This function is translated from bitcoind's IsDERSignature and is used in
   * the script interpreter.  This "DER" format actually includes an extra byte,
   * the nhashtype, at the end. It is really the tx format, not DER format.
   *
   * A canonical signature exists of: [30] [total len] [02] [len R] [R] [02] [len S] [S] [hashtype]
   * Where R and S are not negative (their first byte has its highest bit not set), and not
   * excessively padded (do not start with a 0 byte, unless an otherwise negative number follows,
   * in which case a single 0 byte is necessary and even required).
   *
   * See https://bitcointalk.org/index.php?topic=8392.msg127623#msg127623
   */
  static isTxDER(): void;

  /**
   * Compares to bitcoind's IsLowDERSignature
   * See also ECDSA signature algorithm which enforces this.
   * See also BIP 62, "low S values in signatures"
   */
  hasLowS(): void;

  /**
   * @returns true if the nhashtype is exactly equal to one of the standard options or combinations thereof.
   * Translated from bitcoind's IsDefinedHashtypeSignature
   */
  hasDefinedHashtype(): any;
}
