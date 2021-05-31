export class TransactionSignature {
  constructor(arg: any | string | TransactionSignature);

  /**
   * Serializes a transaction to a plain JS object
   *
   * @function
   * @return {Object}
   */
  toObject(): any;

  /**
   * Builds a TransactionSignature from an object
   * @param {Object} object
   * @return {TransactionSignature}
   */
  static fromObject(object: any): TransactionSignature;
}
