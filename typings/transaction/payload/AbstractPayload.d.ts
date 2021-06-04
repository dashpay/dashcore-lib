import { PrivateKey } from '../../PrivateKey';

/**
 * @constructor
 */
export class AbstractPayload {
  constructor();

  /**
   *
   * @param [options]
   * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
   * @return {Buffer}
   */
  toBuffer(options?: { skipSignature: boolean }): Buffer;

  /**
   * @param [options]
   * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
   * @return {Object}
   */
  toJSON(options?: { skipSignature: boolean }): any;

  /**
   * @param [options]
   * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
   * @return {string}
   */
  toString(options?: { skipSignature: boolean }): string;

  /**
   * @param [options]
   * @param {Boolean} options.skipSignature - skip signature when serializing. Needed for signing payload
   * @return {Buffer} - hash
   */
  getHash(options?: { skipSignature: boolean }): Buffer;

  /**
   * Signs payload
   * @param {string|PrivateKey} privateKey
   * @return {AbstractPayload}
   */
  sign(privateKey: string | PrivateKey): AbstractPayload;

  /**
   * Verify payload signature
   * @param {string|Buffer} publicKeyId
   * @return {boolean}
   */
  verifySignature(publicKeyId: string | Buffer): boolean;
}
