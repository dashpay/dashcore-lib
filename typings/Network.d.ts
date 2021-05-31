/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
export class Network {
  constructor();
}

/**
 * @namespace Networks
 */
export namespace Networks {
  /**
   * @function
   * @member Networks#get
   * Retrieves the network associated with a magic number or string.
   * @param {string|number|Network} arg
   * @param {string|Array} keys - if set, only check if the magic number associated with this name matches
   * @returns {Network}
   */
  var get: any;
  /**
   * @function
   * @member Networks#add
   * Will add a custom Network
   * @param {Object} data
   * @param {string} data.name - The name of the network
   * @param {string} data.alias - The aliased name of the network
   * @param {Number} data.pubkeyhash - The publickey hash prefix
   * @param {Number} data.privatekey - The privatekey prefix
   * @param {Number} data.scripthash - The scripthash prefix
   * @param {Number} data.xpubkey - The extended public key magic
   * @param {Number} data.xprivkey - The extended private key magic
   * @param {Number} data.networkMagic - The network magic number
   * @param {Number} data.port - The network port
   * @param {Array}  data.dnsSeeds - An array of dns seeds
   * @return {Network}
   */
  var add: any;
  /**
   * @function
   * @member Networks#remove
   * Will remove a custom network
   * @param {Network} network
   */
  var remove: any;
  /**
   * @instance
   * @member Networks#livenet
   */
  var livenet: any;
  /**
   * @instance
   * @member Networks#testnet
   */
  var testnet: any;
  /**
   * @function
   * @member Networks#enableRegtest
   * Will enable regtest features for testnet
   */
  var enableRegtest: any;
  /**
   * @function
   * @member Networks#disableRegtest
   * Will disable regtest features for testnet
   */
  var disableRegtest: any;
}
