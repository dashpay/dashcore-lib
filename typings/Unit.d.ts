/**
 * Utility for handling and converting bitcoins units. The supported units are
 * BTC, mBTC, bits (also named uBTC) and satoshis. A unit instance can be created with an
 * amount and a unit code, or alternatively using static methods like {fromBTC}.
 * It also allows to be created from a fiat amount and the exchange rate, or
 * alternatively using the {fromFiat} static method.
 * You can consult for different representation of a unit instance using it's
 * {to} method, the fixed unit methods like {toSatoshis} or alternatively using
 * the unit accessors. It also can be converted to a fiat amount by providing the
 * corresponding BTC/fiat exchange rate.
 *
 * @example
 * ```javascript
 * var sats = Unit.fromBTC(1.3).toSatoshis();
 * var mili = Unit.fromBits(1.3).to(Unit.mBTC);
 * var bits = Unit.fromFiat(1.3, 350).bits;
 * var btc = new Unit(1.3, Unit.bits).BTC;
 * ```
 *
 * @param {Number} amount - The amount to be represented
 * @param {String|Number} code - The unit of the amount or the exchange rate
 * @returns {Unit} A new instance of a Unit
 * @constructor
 */
export class Unit {
  constructor(amount: number, code: string | number);

  /**
   * Returns a Unit instance created from JSON string or object
   *
   * @param {String|Object} json - JSON with keys: amount and code
   * @returns {Unit} A Unit instance
   */
  static fromObject(json: string | any): Unit;

  /**
   * Returns a Unit instance created from an amount in BTC
   *
   * @param {Number} amount - The amount in BTC
   * @returns {Unit} A Unit instance
   */
  static fromBTC(amount: number): Unit;

  /**
   * Returns a Unit instance created from an amount in mBTC
   *
   * @function
   * @param {Number} amount - The amount in mBTC
   * @returns {Unit} A Unit instance
   */
  static fromMillis(amount: number): Unit;

  /**
   * Returns a Unit instance created from an amount in bits
   *
   * @function
   * @param {Number} amount - The amount in bits
   * @returns {Unit} A Unit instance
   */
  static fromMicros(amount: number): Unit;

  /**
   * Returns a Unit instance created from an amount in satoshis
   *
   * @param {Number} amount - The amount in satoshis
   * @returns {Unit} A Unit instance
   */
  static fromSatoshis(amount: number): Unit;

  /**
   * Returns a Unit instance created from a fiat amount and exchange rate.
   *
   * @param {Number} amount - The amount in fiat
   * @param {Number} rate - The exchange rate BTC/fiat
   * @returns {Unit} A Unit instance
   */
  static fromFiat(amount: number, rate: number): Unit;

  /**
   * Returns the value represented in the specified unit
   *
   * @param {String|Number} code - The unit code or exchange rate
   * @returns {Number} The converted value
   */
  to(code: string | number): number;

  /**
   * Returns the value represented in BTC
   *
   * @returns {Number} The value converted to BTC
   */
  toBTC(): number;

  /**
   * Returns the value represented in mBTC
   *
   * @function
   * @returns {Number} The value converted to mBTC
   */
  toMillis(): number;

  /**
   * Returns the value represented in bits
   *
   * @function
   * @returns {Number} The value converted to bits
   */
  toMicros(): number;

  /**
   * Returns the value represented in bits
   *
   * @function
   * @returns {Number} The value converted to bits
   */
  toBits(): number;

  /**
   * Returns the value represented in satoshis
   *
   * @returns {Number} The value converted to satoshis
   */
  toSatoshis(): number;

  /**
   * Returns the value represented in fiat
   *
   * @param {string} rate - The exchange rate between BTC/currency
   * @returns {Number} The value converted to satoshis
   */
  atRate(rate: string): number;

  /**
   * Returns a string representation of the value in satoshis
   *
   * @returns {string} the value in satoshis
   */
  toString(): string;

  /**
   * Returns a plain object representation of the Unit
   *
   * @function
   * @returns {Object} An object with the keys: amount and code
   */
  toObject(): any;

  /**
   * Returns a plain object representation of the Unit
   *
   * @function
   * @returns {Object} An object with the keys: amount and code
   */
  toJSON(): any;

  /**
   * Returns a string formatted for the console
   *
   * @returns {string} the value in satoshis
   */
  inspect(): string;
}
