/**
 * Represents a generic Governance Object
 *
 * @param serialized
 * @returns {*}
 * @constructor
 */
export class GovObject {
  constructor(serialized: any);

  /**
   * dataHex will output GovObject 'data-hex' value, should be overridden by specific object type
   *
   */
  dataHex(): void;

  /**
   * GovObject instantation method from JSON object, should be overridden by specific GovObject type
   *
   * @param arg
   * @returns Casted GovObject
   */
  fromObject(arg: any): any;

  /**
   * GovObject instantiation method from hex string
   *
   * @param string
   */
  fromString(string: any): void;

  /**
   * Retrieve a hex string that can be used with dashd's CLI interface
   *
   * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
   * @return {string}
   */
  checkedSerialize(opts: any): string;
}
