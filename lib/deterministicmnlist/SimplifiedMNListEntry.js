const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const Hash = require('../crypto/hash');
const constants = require('../constants');
const utils = require('../util/js');
const ipUtils = require('../util/ip');
const { extNetInfoToBuffer, readExtNetInfo } = require('../util/netinfo');
const { readExact, readExactReverse } = require('../transaction/payload/strictpayloadreader');
const Address = require('../address');
const Networks = require('../networks');

const isSha256 = utils.isSha256HexString;
const { isHexStringOfSize } = utils;
const isHexString = utils.isHexaString;
const parseIp = ipUtils.bufferToIPAndPort;
const serializeIp = ipUtils.ipAndPortToBuffer;

const {
  SHA256_HASH_SIZE,
  BLS_PUBLIC_KEY_SIZE,
  PUBKEY_ID_SIZE,
  PLATFORM_NODE_ID_SIZE,
  MASTERNODE_TYPE_BASIC,
  MASTERNODE_TYPE_HP,
  PROTX_EXT_ADDR_VERSION,
} = constants;

/**
 * @typedef {Object} SMLEntry
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {number} [nVersion]
 * @property {number} [nType]
 * @property {number} [platformHTTPPort]
 * @property {string} [platformNodeID]
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */

/**
 * @class SimplifiedMNListEntry
 * @param {string|Object|Buffer} arg - A Buffer, JSON string, or Object representing a SmlEntry
 * @param {string} [network]
 * @constructor
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {number} [nVersion]
 * @property {number} [nType]
 * @property {string} [platformHTTPPort]
 * @property {number} [platformNodeID]
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */
function SimplifiedMNListEntry(arg, network) {
  if (arg) {
    const validNetwork = Networks.get(network);

    if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    }
    if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListEntry.fromBuffer(arg, validNetwork);
    }
    if (_.isObject(arg)) {
      return SimplifiedMNListEntry.fromObject(arg);
    }
    if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    }
    if (isHexString(arg)) {
      return SimplifiedMNListEntry.fromHexString(arg, validNetwork);
    }
    throw new TypeError('Unrecognized argument for SimplifiedMNListEntry');
  }
}

/**
 * Keeps the ExtNetInfo bytes an entry was read from, with the addresses they
 * decoded to. A BIP155 IPv6 address in fc00::/8 (valid on regtest) prints the
 * same as a CJDNS one and extNetInfoToBuffer writes that string as CJDNS, so
 * re-encoding could change the entry's bytes and hash. Core's JSON can't tell
 * the two apart either, so entries from JSON keep the string rule.
 * Non-enumerable, so toObject() and JSON.stringify() leave it out.
 * @param {SimplifiedMNListEntry} entry
 * @param {{buffer: Buffer, addresses: Object<string, string[]>}} rawExtNetInfo
 */
function setRawExtNetInfo(entry, rawExtNetInfo) {
  Object.defineProperty(entry, '_rawExtNetInfo', {
    value: rawExtNetInfo,
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

/**
 * The entry's ExtNetInfo bytes: the ones it was read from while its addresses
 * are unchanged, otherwise its addresses serialized
 * @param {SimplifiedMNListEntry} entry
 * @return {Buffer}
 */
function getExtNetInfoBuffer(entry) {
  const raw = entry._rawExtNetInfo;
  if (raw && _.isEqual(raw.addresses, entry.addresses)) {
    return raw.buffer;
  }
  return extNetInfoToBuffer(entry.addresses);
}

/**
 * Parse buffer and returns SimplifiedMNListEntry
 * @param {Buffer} buffer
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromBuffer = function fromBuffer(buffer, network) {
  const bufferReader = new BufferReader(buffer);

  const object = { };

  object.proRegTxHash = bufferReader.readReverse(SHA256_HASH_SIZE).toString('hex');
  object.confirmedHash = bufferReader
      .readReverse(SHA256_HASH_SIZE)
      .toString('hex');
  object.service = parseIp(bufferReader.read(ipUtils.IP_AND_PORT_SIZE));
  object.pubKeyOperator = bufferReader.read(BLS_PUBLIC_KEY_SIZE).toString('hex');
  object.votingAddress = Address.fromPublicKeyHash(
      bufferReader.read(PUBKEY_ID_SIZE),
      network
    ).toString();

  object.isValid = Boolean(bufferReader.readUInt8());

  // In case of version 2, sml entry should contain more fields but
  // we don't know version here

  if (!bufferReader.finished()) {
    object.nType = bufferReader.readUInt16LE();
  }

  if (typeof object.nType === 'number') {
    object.nVersion = 2;
  }

  if (object.nType === MASTERNODE_TYPE_HP) {
    object.platformHTTPPort = bufferReader.readUInt16LE();
    object.platformNodeID = bufferReader.readReverse(PLATFORM_NODE_ID_SIZE).toString('hex');
  }

  return SimplifiedMNListEntry.fromObject(object);
};

/**
 * Reads an entry as Core sends it in the P2P `mnlistdiff` message:
 * nVersion followed by the hashed fields (see toP2PBuffer)
 * @param {BufferReader} bufferReader
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromP2PBufferReader = function fromP2PBufferReader(bufferReader, network) {
  const object = {};

  object.nVersion = bufferReader.readUInt16LE();
  object.proRegTxHash = readExactReverse(bufferReader, SHA256_HASH_SIZE).toString('hex');
  object.confirmedHash = readExactReverse(bufferReader, SHA256_HASH_SIZE).toString('hex');
  let rawExtNetInfo;
  if (object.nVersion >= PROTX_EXT_ADDR_VERSION) {
    const start = bufferReader.pos;
    object.addresses = readExtNetInfo(bufferReader);
    rawExtNetInfo = {
      buffer: Buffer.from(bufferReader.buf.slice(start, bufferReader.pos)),
      addresses: _.cloneDeep(object.addresses),
    };
  } else {
    object.service = parseIp(readExact(bufferReader, ipUtils.IP_AND_PORT_SIZE));
  }
  object.pubKeyOperator = readExact(bufferReader, BLS_PUBLIC_KEY_SIZE).toString('hex');
  object.votingAddress = Address.fromPublicKeyHash(
    readExact(bufferReader, PUBKEY_ID_SIZE),
    network
  ).toString();
  object.isValid = Boolean(bufferReader.readUInt8());

  // Version 1 entries carry no type; Core reads them as regular masternodes,
  // though its RPC can report type 1 for revoked version 1 evonodes
  object.nType = MASTERNODE_TYPE_BASIC;
  if (object.nVersion >= 2) {
    object.nType = bufferReader.readUInt16LE();
    if (object.nType === MASTERNODE_TYPE_HP) {
      if (object.nVersion < PROTX_EXT_ADDR_VERSION) {
        object.platformHTTPPort = bufferReader.readUInt16LE();
      }
      object.platformNodeID = readExactReverse(bufferReader, PLATFORM_NODE_ID_SIZE).toString('hex');
    }
  }

  const entry = SimplifiedMNListEntry.fromObject(object);
  if (rawExtNetInfo) {
    setRawExtNetInfo(entry, rawExtNetInfo);
  }
  return entry;
};

/**
 * @param {string} string
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromHexString = function fromHexString(string, network) {
  return SimplifiedMNListEntry.fromBuffer(Buffer.from(string, 'hex'), network);
};

/**
 * Serialize SML entry to buffer
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.toBuffer = function toBuffer() {
  this.validate();
  const hasExtAddr = this.nVersion >= PROTX_EXT_ADDR_VERSION;
  const bufferWriter = new BufferWriter();

  bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.confirmedHash, 'hex').reverse());
  if (hasExtAddr) {
    bufferWriter.write(getExtNetInfoBuffer(this));
  } else {
    bufferWriter.write(serializeIp(this.service));
  }
  bufferWriter.write(Buffer.from(this.pubKeyOperator, 'hex'));
  bufferWriter.write(
    Buffer.from(Address.fromString(this.votingAddress).hashBuffer, 'hex')
  );
  bufferWriter.writeUInt8(Number(this.isValid));

  if (this.nVersion >= 2) {
    if (typeof this.nType === 'number') {
      bufferWriter.writeUInt16LE(this.nType);

      if (this.nType === MASTERNODE_TYPE_HP) {
        // ExtAddr entries keep the platform ports in their addresses
        if (!hasExtAddr) {
          bufferWriter.writeUInt16LE(this.platformHTTPPort);
        }
        bufferWriter.write(Buffer.from(this.platformNodeID, 'hex').reverse());
      }
    }
  }

  return bufferWriter.toBuffer();
};

/**
 * Serialize SML entry as Core sends it in the P2P `mnlistdiff` message
 * (protocol 70228 and later): nVersion, then the fields toBuffer() hashes
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.toP2PBuffer = function toP2PBuffer() {
  const bufferWriter = new BufferWriter();
  // Entries from Core RPC that predate nVersion are version 1 (legacy BLS)
  bufferWriter.writeUInt16LE(typeof this.nVersion === 'number' ? this.nVersion : 1);
  bufferWriter.write(this.toBuffer());
  return bufferWriter.toBuffer();
};

/**
 * Create SMLEntry from an object
 * @param {SMLEntry} obj
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromObject = function fromObject(obj) {
  const SMLEntry = new SimplifiedMNListEntry();
  SMLEntry.proRegTxHash = obj.proRegTxHash;
  SMLEntry.confirmedHash = obj.confirmedHash;
  SMLEntry.service = obj.service;
  SMLEntry.pubKeyOperator = obj.pubKeyOperator;
  SMLEntry.votingAddress = obj.votingAddress;
  SMLEntry.isValid = obj.isValid;
  SMLEntry.nVersion = obj.nVersion;
  SMLEntry.nType = obj.nType;
  SMLEntry.platformHTTPPort = obj.platformHTTPPort;
  SMLEntry.platformNodeID = obj.platformNodeID;
  SMLEntry.addresses = _.cloneDeep(obj.addresses);
  SMLEntry.payoutAddress = obj.payoutAddress;
  SMLEntry.operatorPayoutAddress = obj.operatorPayoutAddress;
  SMLEntry.network = Address.fromString(obj.votingAddress).network;

  // Core reports `service` and `platformHTTPPort` only with -deprecatedrpc=service,
  // and derives both from `addresses`. ExtAddr entries hash `addresses` instead of
  // these fields, so for them always take both from `addresses`.
  if (SMLEntry.addresses) {
    const hasExtAddr = SMLEntry.nVersion >= PROTX_EXT_ADDR_VERSION;
    const [coreP2P] = SMLEntry.addresses.core_p2p || [];
    const [platformHTTPS] = SMLEntry.addresses.platform_https || [];
    if (hasExtAddr || SMLEntry.service === undefined) {
      SMLEntry.service = coreP2P || '[0:0:0:0:0:0:0:0]:0';
    }
    // A legacy evonode with no addresses (revoked) still hashes its port, which
    // `addresses` can't recover; validate() rejects it unless Core reported the port.
    if (
      SMLEntry.nType === MASTERNODE_TYPE_HP &&
      (hasExtAddr || SMLEntry.platformHTTPPort === undefined)
    ) {
      SMLEntry.platformHTTPPort = platformHTTPS
        ? Number(platformHTTPS.slice(platformHTTPS.lastIndexOf(':') + 1))
        : undefined;
    }
  }

  SMLEntry.validate();

  return SMLEntry;
};

SimplifiedMNListEntry.prototype.validate = function validate() {
  const hasExtAddr = this.nVersion >= PROTX_EXT_ADDR_VERSION;
  $.checkArgument(
    isSha256(this.proRegTxHash),
    'Expected proRegTxHash to be a sha256 hex string'
  );
  $.checkArgument(
    isSha256(this.confirmedHash),
    'Expected confirmedHash to be a sha256 hex string'
  );
  if (hasExtAddr) {
    extNetInfoToBuffer(this.addresses);
  } else if (!ipUtils.isZeroAddress(this.service)) {
    $.checkArgument(
      ipUtils.isIPV4(this.service),
      'Expected service to be a string with ip address and port'
    );
  }
  $.checkArgument(
    isHexStringOfSize(this.pubKeyOperator, BLS_PUBLIC_KEY_SIZE * 2),
    'Expected pubKeyOperator to be a pubkey id'
  );
  $.checkArgument(
    Address.isValid(this.votingAddress),
    'votingAddress is not valid'
  );
  $.checkArgument(
    typeof this.isValid === 'boolean',
    'Expected isValid to be a boolean'
  );
  // Core's MnType has only Regular (0) and Evo (1)
  $.checkArgument(
    this.nType === MASTERNODE_TYPE_BASIC || this.nType === MASTERNODE_TYPE_HP,
    'Expected nType to be 0 (regular) or 1 (evo)'
  );

  if (this.nType === constants.MASTERNODE_TYPE_HP) {
    if (!hasExtAddr) {
      $.checkArgument(
        typeof this.platformHTTPPort === 'number',
        'Expected platformHTTPPort to be a number'
      );
    }

    $.checkArgument(
      typeof this.platformNodeID === 'string',
      'Expected platformNodeID to be a string'
    );
  }
};

SimplifiedMNListEntry.prototype.toObject = function toObject() {
  const result = {
    proRegTxHash: this.proRegTxHash,
    confirmedHash: this.confirmedHash,
    service: this.service,
    pubKeyOperator: this.pubKeyOperator,
    votingAddress: this.votingAddress,
    isValid: this.isValid,
  };

  if (typeof this.nVersion === 'number') {
    result.nVersion = this.nVersion;
  }

  if (typeof this.nType === 'number') {
    result.nType = this.nType;
  }

  if (this.payoutAddress) {
    result.payoutAddress = this.payoutAddress;
  }

  if (this.operatorPayoutAddress) {
    result.operatorPayoutAddress = this.operatorPayoutAddress;
  }

  if (this.platformHTTPPort) {
    result.platformHTTPPort = this.platformHTTPPort;
  }

  if (this.platformNodeID) {
    result.platformNodeID = this.platformNodeID;
  }

  if (this.addresses) {
    result.addresses = _.cloneDeep(this.addresses);
  }

  return result;
};

/**
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.calculateHash = function calculateHash() {
  return Hash.sha256sha256(this.toBuffer());
};

/**
 * Gets the ip from the service property
 * @return {string}
 */
SimplifiedMNListEntry.prototype.getIp = function getIp() {
  if (this.service.startsWith('[')) {
    return this.service.slice(1, this.service.indexOf(']'));
  }
  return this.service.split(':')[0];
};

/**
 * Gets the evonode's Platform HTTPS endpoint: the first `platform_https` address
 * of a version 3 (ExtAddr) entry, which may be an IPv6 address or a domain, or
 * the service ip with platformHTTPPort of an older one. PoSe-banned entries
 * have endpoints too; check isValid before using one.
 * @return {{host: string, port: number}|null} host without IPv6 brackets, like
 * getIp(); null for regular masternodes and evonodes without an address
 */
SimplifiedMNListEntry.prototype.getPlatformHTTPSEndpoint = function getPlatformHTTPSEndpoint() {
  if (this.nType !== MASTERNODE_TYPE_HP) {
    return null;
  }

  // ExtAddr entries: host and port both come from the current platform_https[0]
  if (this.nVersion >= PROTX_EXT_ADDR_VERSION) {
    const [address] = (this.addresses && this.addresses.platform_https) || [];
    if (typeof address !== 'string' || ipUtils.isZeroAddress(address)) {
      return null;
    }
    const separator = address.lastIndexOf(':');
    const port = Number(address.slice(separator + 1));
    // port 0 is reserved, not a reachable HTTPS endpoint
    if (port === 0) {
      return null;
    }
    return {
      host: address.slice(0, separator).replace(/^\[(.*)\]$/, '$1'),
      port,
    };
  }

  if (
    typeof this.platformHTTPPort !== 'number'
    || this.platformHTTPPort === 0
    || ipUtils.isZeroAddress(this.service)
  ) {
    return null;
  }
  return { host: this.getIp(), port: this.platformHTTPPort };
};

/**
 * Serialize confirmed hash with proRegTxHash for MN scores
 * and quorum member selection
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.confirmedHashWithProRegTxHash =
  function confirmedHashWithProRegTxHash() {
    const bufferWriter = new BufferWriter();
    bufferWriter.write(Buffer.from(this.confirmedHash, 'hex'));
    bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex'));
    return Hash.sha256(bufferWriter.toBuffer().reverse()).reverse();
  };

/**
 * Creates a copy of SimplifiedMNListEntry
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.prototype.copy = function copy() {
  const entry = _.cloneDeep(this);
  if (this._rawExtNetInfo) {
    setRawExtNetInfo(entry, this._rawExtNetInfo);
  }
  return entry;
};

module.exports = SimplifiedMNListEntry;
