/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var strictReader = require('./strictpayloadreader');
var readExact = strictReader.readExact;
var readExactReverse = strictReader.readExactReverse;
var readVarBytes = strictReader.readVarBytes;
var AbstractPayload = require('./abstractpayload');
var utils = require('../../util/js');
var Script = require('../../script');
var ipUtils = require('../../util/ip');
var netInfo = require('../../util/netinfo');
var protxUtils = require('./protxutils');
var _ = require('lodash');
const { MASTERNODE_TYPE_BASIC,
  MASTERNODE_TYPE_HP,
  PLATFORM_NODE_ID_SIZE,
  PROTX_EXT_ADDR_VERSION,
} = require("../../constants");

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;
var isSha256HexString = utils.isSha256HexString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var BLSSIG_SIZE = constants.BLS_SIGNATURE_SIZE;

/**
 * @typedef {Object} ProUpServTxPayloadJSON
 * @property {number} version
 * @property {number} [type]
 * @property {string} proTxHash
 * @property {string} [service] - Service string, ip and port. Before version 3
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose. From version 3
 * @property {string} [operatorPayoutAddress] - omitted when there is no operator payee
 * @property {string} inputsHash
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port. Before version 3
 * @property {number} [platformHTTPPort] Platform HTTP port. Before version 3
 * @property {string} [payloadSig]
 */

/**
 * @class ProUpServTxPayload
 * @property {number} version ProUpServTx version number. Currently set to 1.
 * @property {number} [type]
 * @property {string} proTXHash The hash of the initial ProRegTx
 * @property {string} [service] string - ip and port. Before version 3
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose. From version 3
 * @property {string} inputsHash Hash of all the outpoints of the transaction inputs
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port. Before version 3
 * @property {number} [platformHTTPPort] Platform HTTP port. Before version 3
 * @property {string} [scriptOperatorPayout] Payee script (p2pkh/p2sh), empty if none
 * @property {string} [payloadSig] BLSSig Signature of the hash of the ProUpServTx fields. Signed by the Operator.
 */
function ProUpServTxPayload(payloadJSON) {
  AbstractPayload.call(this);

  if (payloadJSON) {
    this.version = payloadJSON.version;

    if (this.version >= 2) {
      this.type = payloadJSON.type;
    } else {
      protxUtils.checkNoFields(payloadJSON, ['type'], this.version);
    }
    // only version 2+ evonodes have platform fields
    if (this.version < 2 || this.type !== MASTERNODE_TYPE_HP) {
      protxUtils.checkNoFields(
        payloadJSON,
        ['platformNodeID', 'platformP2PPort', 'platformHTTPPort'],
        this.version < 2 ? this.version : 'a regular masternode payload'
      );
    }

    this.proTxHash = payloadJSON.proTxHash;
    if (this.version >= PROTX_EXT_ADDR_VERSION) {
      protxUtils.checkNoFields(
        payloadJSON,
        ['service', 'platformP2PPort', 'platformHTTPPort'],
        this.version
      );
      this.addresses = _.cloneDeep(payloadJSON.addresses);
    } else {
      protxUtils.checkNoFields(payloadJSON, ['addresses'], this.version);
      this.service = payloadJSON.service;
    }
    this.scriptOperatorPayout = payloadJSON.operatorPayoutAddress
      ? Script.fromAddress(payloadJSON.operatorPayoutAddress).toHex()
      : '';
    this.inputsHash = payloadJSON.inputsHash;

    if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
      this.platformNodeID = payloadJSON.platformNodeID;
      if (this.version < PROTX_EXT_ADDR_VERSION) {
        this.platformP2PPort = payloadJSON.platformP2PPort;
        this.platformHTTPPort = payloadJSON.platformHTTPPort;
      }
    }

    if (payloadJSON.payloadSig) {
      this.payloadSig = payloadJSON.payloadSig;
    }

    this.validate();
  } else {
    this.version = CURRENT_PAYLOAD_VERSION;
  }
}

ProUpServTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProUpServTxPayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProUpServTxPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  // like Core, reject an unknown version before choosing a layout
  protxUtils.validateVersion(payload.version);

  if (payload.version >= 2) {
    payload.type = payloadBufferReader.readUInt16LE();
  }

  // exact reads, as Core's deserializer; readExactReverse copies, so the
  // caller's buffer isn't reversed in place
  payload.proTxHash = readExactReverse(payloadBufferReader, HASH_SIZE)
    .toString('hex');
  if (payload.version >= PROTX_EXT_ADDR_VERSION) {
    protxUtils.readAddresses(payload, payloadBufferReader);
  } else {
    payload.service = ipUtils.bufferToIPAndPort(
      readExact(payloadBufferReader, ipUtils.IP_AND_PORT_SIZE)
    );
  }
  // Note: can be 0 if not updated!
  payload.scriptOperatorPayout = readVarBytes(payloadBufferReader).toString(
    'hex'
  );
  payload.inputsHash = readExactReverse(payloadBufferReader, HASH_SIZE)
    .toString('hex');

  if (payload.version >= 2 && payload.type === MASTERNODE_TYPE_HP) {
    payload.platformNodeID = readExactReverse(payloadBufferReader, PLATFORM_NODE_ID_SIZE).toString('hex');
    // ExtAddr evonodes keep the platform ports in their addresses
    if (payload.version < PROTX_EXT_ADDR_VERSION) {
      payload.platformP2PPort = payloadBufferReader.readUInt16LE();
      payload.platformHTTPPort = payloadBufferReader.readUInt16LE();
    }
  }

  payload.payloadSig = readExact(payloadBufferReader, BLSSIG_SIZE).toString('hex');

  if (!payloadBufferReader.finished()) {
    throw new Error(
      'Failed to parse payload: raw payload is bigger than expected.'
    );
  }

  payload.validate();
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {ProUpServTxPayloadJSON} payloadJson
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.fromJSON = function fromJSON(payloadJson) {
  return new ProUpServTxPayload(payloadJson);
};

/* Instance methods */

/**
 * Validates payload data: its structure and the context-free checks of Core's
 * CProUpServTx::IsTriviallyValid and CheckProviderNetworkFields. Left to Core:
 * CNetAddr::IsValid for a version 1 or 2 service beyond the zero address,
 * routable addresses, mainnet port rules, and everything that needs the
 * masternode list or the signature.
 * @return {boolean}
 */
ProUpServTxPayload.prototype.validate = function () {
  protxUtils.validateVersion(this.version);

  // version 1 has no type and is always a regular masternode
  if (this.version >= 2) {
    Preconditions.checkArgument(
      this.type === MASTERNODE_TYPE_BASIC || this.type === MASTERNODE_TYPE_HP,
      'Expect type to be 0 (regular) or 1 (evo)'
    );
  }

  Preconditions.checkArgument(
    isSha256HexString(this.proTxHash),
    'Expect proTXHash to be a hex string representing sha256 hash'
  );

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    // Core requires addresses in a ProUpServTx (CProUpServTx::IsTriviallyValid)
    netInfo.validateMasternodeAddresses(this.addresses, {
      evo: this.type === MASTERNODE_TYPE_HP,
      allowEmpty: false,
    });
  } else {
    // ...in every version
    Preconditions.checkArgument(
      !ipUtils.isZeroAddress(this.service) && ipUtils.isIPV4(this.service),
      'Expected service to be a string with ip address and port'
    );
  }

  Preconditions.checkArgument(
    isSha256HexString(this.inputsHash),
    'Expect inputsHash to be a hex string representing sha256 hash'
  );

  // CheckProviderNetworkFields; its mainnet-only port rules are left to Core
  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    protxUtils.validateKeyID(this.platformNodeID, 'platformNodeID');

    if (this.version < PROTX_EXT_ADDR_VERSION) {
      protxUtils.validateLegacyPlatformPorts(
        this.platformP2PPort,
        this.platformHTTPPort,
        Number(this.service.slice(this.service.lastIndexOf(':') + 1))
      );
    }
  }

  // empty for no operator payee, else Core's exact P2PKH/P2SH (CheckProUpServTx)
  if (this.scriptOperatorPayout) {
    Preconditions.checkArgument(
      protxUtils.isPayoutScript(this.scriptOperatorPayout),
      'Expected scriptOperatorPayout to be a p2pkh/p2sh'
    );
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgument(
      isHexString(this.payloadSig),
      'Expect payloadSig to be a hex string'
    );
    Preconditions.checkArgument(
      this.payloadSig.length === BLSSIG_SIZE * 2,
      "payloadSig size doesn't match BLS signature size"
    );
  }
  return true;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param [options.skipSignature]
 * @param [options.network] - network param for payout address serialization
 * @return {ProUpServTxPayloadJSON}
 */
ProUpServTxPayload.prototype.toJSON = function toJSON(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  var network = options && options.network;
  this.validate();
  /**
   * @type {ProUpServTxPayloadJSON}
   */
  var payloadJSON = {
    version: this.version,
    proTxHash: this.proTxHash,
  };

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payloadJSON.addresses = _.cloneDeep(this.addresses);
  } else {
    payloadJSON.service = this.service;
  }

  // An empty script means no operator payee; like Core, leave the address out
  if (this.scriptOperatorPayout) {
    payloadJSON.operatorPayoutAddress = new Script(this.scriptOperatorPayout)
      .toAddress(network)
      .toString();
  }

  payloadJSON.inputsHash = this.inputsHash;

  if (this.version >= 2) {
    payloadJSON.type = this.type;

    if (this.type === MASTERNODE_TYPE_HP) {
      payloadJSON.platformNodeID = this.platformNodeID;
      if (this.version < PROTX_EXT_ADDR_VERSION) {
        payloadJSON.platformP2PPort = this.platformP2PPort;
        payloadJSON.platformHTTPPort = this.platformHTTPPort;
      }
    }
  }

  if (!skipSignature) {
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {Boolean} options.skipSignature - skip signature. Used for generating new signature
 * @return {Buffer}
 */
ProUpServTxPayload.prototype.toBuffer = function toBuffer(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);

  this.validate();
  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter.writeUInt16LE(this.version);

  if (this.version >= 2) {
    payloadBufferWriter.writeUInt16LE(this.type);
  }

  payloadBufferWriter.write(Buffer.from(this.proTxHash, 'hex').reverse());

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payloadBufferWriter.write(protxUtils.addressesToBuffer(this));
  } else {
    payloadBufferWriter.write(ipUtils.ipAndPortToBuffer(this.service));
  }

  var scriptOperatorPayout = Buffer.from(this.scriptOperatorPayout, 'hex');
  payloadBufferWriter.writeVarintNum(scriptOperatorPayout.length);
  payloadBufferWriter.write(scriptOperatorPayout);

  payloadBufferWriter.write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    payloadBufferWriter.write(Buffer.from(this.platformNodeID, 'hex').reverse());
    if (this.version < PROTX_EXT_ADDR_VERSION) {
      payloadBufferWriter
        .writeUInt16LE(this.platformP2PPort)
        .writeUInt16LE(this.platformHTTPPort);
    }
  }

  var payloadSignature;

  if (skipSignature) {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  } else {
    payloadSignature = Buffer.from(this.payloadSig, 'hex');
    payloadBufferWriter.write(payloadSignature);
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Copy payload instance
 * @return {ProUpServTxPayload}
 */
ProUpServTxPayload.prototype.copy = function copy() {
  var copy = ProUpServTxPayload.fromJSON(this.toJSON());
  protxUtils.copyAddressBytes(this, copy);
  return copy;
};

module.exports = ProUpServTxPayload;
