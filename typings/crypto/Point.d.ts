import { BN } from './BN';
/**
 *
 * Instantiate a valid secp256k1 Point from the X and Y coordinates.
 *
 * @param {BN|String} x - The X coordinate
 * @param {BN|String} y - The Y coordinate
 * @param {Boolean} isRed - Force redgomery representation when loading from JSON
 * @link https://github.com/indutny/elliptic
 * @augments elliptic.curve.point
 * @throws {Error} A validation error if exists
 * @returns {Point} An instance of Point
 * @constructor
 */
// @ts-ignore
export class Point extends elliptic.curve.point {
  constructor(x: BN | string, y: BN | string, isRed: Boolean);

  /**
   *
   * Instantiate a valid secp256k1 Point from only the X coordinate
   *
   * @param {boolean} odd - If the Y coordinate is odd
   * @param {BN|String} x - The X coordinate
   * @throws {Error} A validation error if exists
   * @returns {Point} An instance of Point
   */
  static fromX(odd: boolean, x: BN | string): Point;

  /**
   *
   * Will return a secp256k1 ECDSA base point.
   *
   * @link https://en.bitcoin.it/wiki/Secp256k1
   * @returns {Point} An instance of the base point.
   */
  static getG(): Point;

  /**
   *
   * Will return the max of range of valid private keys as governed by the secp256k1 ECDSA standard.
   *
   * @link https://en.bitcoin.it/wiki/Private_key#Range_of_valid_ECDSA_private_keys
   * @returns {BN} A BN instance of the number of points on the curve
   */
  static getN(): BN;

  /**
   *
   * Will return the X coordinate of the Point
   *
   * @returns {BN} A BN instance of the X coordinate
   */
  getX(): BN;

  /**
   *
   * Will return the Y coordinate of the Point
   *
   * @returns {BN} A BN instance of the Y coordinate
   */
  getY(): BN;

  /**
   *
   * Will determine if the point is valid
   *
   * @link https://www.iacr.org/archive/pkc2003/25670211/25670211.pdf
   * @param {Point} An instance of Point
   * @throws {Error} A validation error if exists
   * @returns {Point} An instance of the same Point
   */
  validate(An: Point): Point;
}
