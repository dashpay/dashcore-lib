const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
// Core-canonical CompactSizes and exact reads, as Core's deserializer
const { readExact, readCompactSize } = require('../transaction/payload/strictpayloadreader');
const isDenseArray = require('./isDenseArray');

// Serialization of Dash Core's ExtNetInfo (src/evo/netinfo.h), the address
// format of ExtAddr (version 3) masternode entries.

const EXT_NET_INFO_VERSION = 1;
// MAX_ENTRIES_EXTNETINFO
const MAX_ENTRIES_PER_PURPOSE = 4;

// NetInfoPurpose: a purpose's code is its index in this list
const PURPOSES = ['core_p2p', 'platform_p2p', 'platform_https'];

// NetInfoEntry::NetInfoType
const ENTRY_TYPE_SERVICE = 0x01;
const ENTRY_TYPE_DOMAIN = 0x02;

// BIP155 network ids
const BIP155_IPV4 = 0x01;
const BIP155_IPV6 = 0x02;
const BIP155_TORV3 = 0x04;
const BIP155_I2P = 0x05;
const BIP155_CJDNS = 0x06;

const IPV4_ADDRESS_SIZE = 4;
const IPV6_ADDRESS_SIZE = 16;
const TORV3_ADDRESS_SIZE = 32;
const TORV3_CHECKSUM_SIZE = 2;
const TORV3_VERSION = 3;
const I2P_ADDRESS_SIZE = 32;
const CJDNS_ADDRESS_SIZE = 16;
const CJDNS_PREFIX = 0xfc;

// Address sizes by BIP155 network id
const BIP155_ADDRESS_SIZES = {
  [BIP155_IPV4]: IPV4_ADDRESS_SIZE,
  [BIP155_IPV6]: IPV6_ADDRESS_SIZE,
  [BIP155_TORV3]: TORV3_ADDRESS_SIZE,
  [BIP155_I2P]: I2P_ADDRESS_SIZE,
  [BIP155_CJDNS]: CJDNS_ADDRESS_SIZE,
};

// IPv6 prefixes Core doesn't read as IPv6 in BIP155 form (CNetAddr::UnserializeV2Stream)
const IPV6_DISALLOWED_PREFIXES = [
  Buffer.from('00000000000000000000ffff', 'hex'), // IPv4-mapped
  Buffer.from('fd87d87eeb43', 'hex'), // Tor v2
  Buffer.from('fd6b88c08724', 'hex'), // internal
];

// DOMAIN_MAX_LEN, the longest domain Core's DomainPort serializes (LIMITED_STRING)
const DOMAIN_MAX_LENGTH = 253;

const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
// The longest base32 name decoded: a Tor v3 name (I2P names have 52 characters)
const BASE32_MAX_LENGTH = 56;
const DOMAIN_REGEX = /^[a-z0-9.-]+$/;
const IPV4_REGEX =
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

/**
 * @param {string} string - unpadded lowercase RFC 4648 base32
 * @return {Buffer}
 */
function decodeBase32(string) {
  if (string.length > BASE32_MAX_LENGTH) {
    throw new Error(`Base32 name ${string.slice(0, 16)}... is too long`);
  }
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < string.length; i++) {
    const value = BASE32_ALPHABET.indexOf(string[i]);
    if (value === -1) {
      throw new Error(`Invalid base32 character in ${string}`);
    }
    // eslint-disable-next-line no-bitwise
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      // eslint-disable-next-line no-bitwise
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  // Leftover bits must be zero so that each address has one encoding
  // eslint-disable-next-line no-bitwise
  if ((buffer & ((1 << bits) - 1)) !== 0) {
    throw new Error(`Non-canonical base32 in ${string}`);
  }
  return Buffer.from(bytes);
}

/**
 * @param {Buffer} buffer
 * @return {string} unpadded lowercase RFC 4648 base32
 */
function encodeBase32(buffer) {
  let string = '';
  let value = 0;
  let bits = 0;
  for (let i = 0; i < buffer.length; i++) {
    // eslint-disable-next-line no-bitwise
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      // eslint-disable-next-line no-bitwise
      string += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    // eslint-disable-next-line no-bitwise
    string += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return string;
}

/**
 * The bytes a .onion name encodes: pubkey || checksum[2] || version[1], with
 * torv3::Checksum from Core's netaddress.cpp
 * @param {Buffer} pubKey
 * @return {Buffer}
 */
function torV3AddressBytes(pubKey) {
  // Required here rather than at the top: @noble/hashes/sha3 calls BigInt when it
  // loads, and only Tor v3 addresses need it, so the rest of the library doesn't
  // need BigInt support
  // eslint-disable-next-line global-require
  const { sha3_256: sha3256 } = require('@noble/hashes/sha3');
  const digest = sha3256(
    Buffer.concat([Buffer.from('.onion checksum', 'ascii'), pubKey, Buffer.from([TORV3_VERSION])]),
  );
  const checksum = Buffer.from(digest).slice(0, TORV3_CHECKSUM_SIZE);
  return Buffer.concat([pubKey, checksum, Buffer.from([TORV3_VERSION])]);
}

/**
 * Whether Core reads a BIP155 IPv6 address as something other than IPv6 (an
 * embedded IPv4, Tor v2 or internal address, see CNetAddr::UnserializeV2Stream)
 * @param {Buffer} address
 * @return {boolean}
 */
function isDisallowedIPv6(address) {
  return IPV6_DISALLOWED_PREFIXES.some((prefix) => address.indexOf(prefix) === 0);
}

/**
 * Formats an IPv6 address like Core (IPv6ToString in netaddress.cpp): RFC 5952
 * zero compression of the first longest run of at least two zero groups
 * @param {Buffer} address
 * @return {string}
 */
function ipv6ToString(address) {
  const groups = [];
  for (let i = 0; i < IPV6_ADDRESS_SIZE; i += 2) {
    groups.push(address.readUInt16BE(i).toString(16));
  }

  // The strict > keeps the first of equally long zero runs
  let longestStart = 0;
  let longestLength = 0;
  let currentStart = 0;
  let currentLength = 0;
  groups.forEach((group, i) => {
    if (group !== '0') {
      currentStart = i + 1;
      currentLength = 0;
      return;
    }
    currentLength += 1;
    if (currentLength > longestLength) {
      longestStart = currentStart;
      longestLength = currentLength;
    }
  });

  // A single zero group isn't compressed
  if (longestLength < 2) {
    return groups.join(':');
  }
  const head = groups.slice(0, longestStart).join(':');
  const tail = groups.slice(longestStart + longestLength).join(':');
  return `${head}::${tail}`;
}

/**
 * @param {string} address - IPv6 address without brackets, as printed by Core
 * @return {Buffer}
 */
function ipv6ToBuffer(address) {
  const halves = address.split('::');
  if (halves.length > 2) {
    throw new Error(`Invalid IPv6 address ${address}`);
  }
  const parseGroups = (part) => (part === '' ? [] : part.split(':'));
  const head = parseGroups(halves[0]);
  const tail = halves.length === 2 ? parseGroups(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  // `::` stands for at least one zero group
  if (halves.length === 2 ? missing < 1 : missing !== 0) {
    throw new Error(`Invalid IPv6 address ${address}`);
  }
  const groups = head.concat(new Array(missing).fill('0'), tail);
  const buffer = Buffer.alloc(IPV6_ADDRESS_SIZE);
  groups.forEach((group, i) => {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) {
      throw new Error(`Invalid IPv6 address ${address}`);
    }
    buffer.writeUInt16BE(parseInt(group, 16), i * 2);
  });
  return buffer;
}

/**
 * Parses an address in Core's CService::ToStringAddr() form
 * @param {string} host
 * @return {{networkId: number, address: Buffer}}
 */
function parseServiceHost(host) {
  if (IPV4_REGEX.test(host)) {
    return {
      networkId: BIP155_IPV4,
      address: Buffer.from(host.split('.').map(Number)),
    };
  }
  if (host.startsWith('[') && host.endsWith(']')) {
    const address = ipv6ToBuffer(host.slice(1, -1));
    if (isDisallowedIPv6(address)) {
      throw new Error(`Invalid IPv6 address ${host}`);
    }
    // Core prints CJDNS addresses like IPv6. Mainnet and testnet reject unroutable
    // fc00::/8 IPv6, so there it is always CJDNS (regtest may store it as IPv6).
    return {
      networkId: address[0] === CJDNS_PREFIX ? BIP155_CJDNS : BIP155_IPV6,
      address,
    };
  }
  if (host.endsWith('.onion')) {
    const decoded = decodeBase32(host.replace(/\.onion$/, ''));
    const pubKey = decoded.slice(0, TORV3_ADDRESS_SIZE);
    // covers the length, checksum and version
    if (!decoded.equals(torV3AddressBytes(pubKey))) {
      throw new Error(`Invalid Tor v3 address ${host}`);
    }
    return { networkId: BIP155_TORV3, address: pubKey };
  }
  if (host.endsWith('.b32.i2p')) {
    const decoded = decodeBase32(host.replace(/\.b32\.i2p$/, ''));
    if (decoded.length !== I2P_ADDRESS_SIZE) {
      throw new Error(`Invalid I2P address ${host}`);
    }
    return { networkId: BIP155_I2P, address: decoded };
  }
  return null;
}

/**
 * Parses one entry from its "addr:port" JSON form
 * @param {string} entry
 * @return {{host: string, port: number, service: ?{networkId: number, address: Buffer}}}
 *   service is null for a domain
 */
function parseEntry(entry) {
  const separator = entry.lastIndexOf(':');
  const host = entry.slice(0, separator);
  const portString = entry.slice(separator + 1);
  const port = Number(portString);
  if (separator <= 0 || !/^[0-9]{1,5}$/.test(portString) || port > 0xffff) {
    throw new Error(`Invalid address entry ${entry}`);
  }

  const service = parseServiceHost(host);
  if (!service && (!DOMAIN_REGEX.test(host) || host.length > DOMAIN_MAX_LENGTH)) {
    throw new Error(`Invalid address entry ${entry}`);
  }
  return { host, port, service };
}

/**
 * Serializes one NetInfoEntry from its "addr:port" JSON form
 * @param {BufferWriter} writer
 * @param {string} entry
 */
function writeNetInfoEntry(writer, entry) {
  const { host, port, service } = parseEntry(entry);
  if (service) {
    writer.writeUInt8(ENTRY_TYPE_SERVICE);
    writer.writeUInt8(service.networkId);
    writer.writeVarintNum(service.address.length);
    writer.write(service.address);
  } else {
    const domain = Buffer.from(host, 'ascii');
    writer.writeUInt8(ENTRY_TYPE_DOMAIN);
    writer.writeVarintNum(domain.length);
    writer.write(domain);
  }
  writer.writeUInt16BE(port);
}

/**
 * Serializes ExtNetInfo from the `addresses` object Core reports for it
 * (purpose name => list of "addr:port" strings)
 * @param {Object<string, string[]>} addresses
 * @return {Buffer}
 */
function extNetInfoToBuffer(addresses) {
  if (!_.isPlainObject(addresses)) {
    throw new Error('Expected addresses to be an object');
  }
  Object.keys(addresses).forEach((purpose) => {
    if (!PURPOSES.includes(purpose)) {
      throw new Error(`Unknown address purpose ${purpose}`);
    }
  });

  const writer = new BufferWriter();
  writer.writeUInt8(EXT_NET_INFO_VERSION);

  // Core serializes a std::map, so purposes go in ascending code order
  const purposes = PURPOSES.filter((purpose) => purpose in addresses);
  writer.writeVarintNum(purposes.length);
  purposes.forEach((purpose) => {
    const entries = addresses[purpose];
    // forEach skips empty slots, which would leave the count wrong
    if (!isDenseArray(entries)) {
      throw new Error(`Expected ${purpose} addresses to be an array without empty slots`);
    }
    if (entries.length > MAX_ENTRIES_PER_PURPOSE) {
      throw new Error(`Too many ${purpose} addresses`);
    }
    writer.writeUInt8(PURPOSES.indexOf(purpose));
    writer.writeVarintNum(entries.length);
    entries.forEach((entry) => writeNetInfoEntry(writer, entry));
  });

  return writer.toBuffer();
}

/**
 * Formats a BIP155 address and port like Core's CService::ToStringAddrPort()
 * @param {number} networkId
 * @param {Buffer} address
 * @param {number} port
 * @return {string}
 */
function serviceToString(networkId, address, port) {
  switch (networkId) {
    case BIP155_IPV4:
      return `${Array.from(address).join('.')}:${port}`;
    case BIP155_IPV6:
      if (isDisallowedIPv6(address)) {
        throw new Error(`Invalid IPv6 address ${address.toString('hex')}`);
      }
      return `[${ipv6ToString(address)}]:${port}`;
    case BIP155_CJDNS:
      // Core reads a CJDNS address without the fc prefix as an invalid entry
      if (address[0] !== CJDNS_PREFIX) {
        throw new Error(`Invalid CJDNS address ${address.toString('hex')}`);
      }
      return `[${ipv6ToString(address)}]:${port}`;
    case BIP155_TORV3:
      return `${encodeBase32(torV3AddressBytes(address))}.onion:${port}`;
    case BIP155_I2P:
      return `${encodeBase32(address)}.b32.i2p:${port}`;
    default:
      throw new Error(`Unknown BIP155 network id ${networkId}`);
  }
}

/**
 * Reads one NetInfoEntry and returns its "addr:port" JSON form
 * @param {BufferReader} reader
 * @return {string}
 */
function readNetInfoEntry(reader) {
  const type = reader.readUInt8();
  if (type === ENTRY_TYPE_SERVICE) {
    const networkId = reader.readUInt8();
    const size = readCompactSize(reader);
    if (BIP155_ADDRESS_SIZES[networkId] !== size) {
      throw new Error(`Invalid BIP155 address of network ${networkId} and size ${size}`);
    }
    const address = readExact(reader, size);
    return serviceToString(networkId, address, reader.readUInt16BE());
  }
  if (type === ENTRY_TYPE_DOMAIN) {
    const size = readCompactSize(reader);
    if (size > DOMAIN_MAX_LENGTH) {
      throw new Error(`Domain of ${size} bytes is too long`);
    }
    // latin1 keeps every byte ('ascii' clears the high bit), so DOMAIN_REGEX
    // rejects bytes above 0x7f instead of reading a different domain
    const domain = readExact(reader, size).toString('latin1');
    if (!DOMAIN_REGEX.test(domain)) {
      throw new Error(`Invalid domain ${domain}`);
    }
    return `${domain}:${reader.readUInt16BE()}`;
  }
  throw new Error(`Unknown address entry type ${type}`);
}

/**
 * Reads ExtNetInfo and returns the `addresses` object Core reports for it
 * (purpose name => list of "addr:port" strings), the input of extNetInfoToBuffer
 * @param {BufferReader} reader - left positioned after the ExtNetInfo
 * @return {Object<string, string[]>}
 */
function readExtNetInfo(reader) {
  const version = reader.readUInt8();
  if (version !== EXT_NET_INFO_VERSION) {
    throw new Error(`Unsupported ExtNetInfo version ${version}`);
  }

  const addresses = {};
  const purposesCount = readCompactSize(reader);
  let previousCode = -1;
  for (let i = 0; i < purposesCount; i++) {
    const code = reader.readUInt8();
    // Core requires known purposes in ascending order
    if (code >= PURPOSES.length || code <= previousCode) {
      throw new Error(`Address purpose ${code} is unknown or out of order`);
    }
    previousCode = code;

    const purpose = PURPOSES[code];
    const entriesCount = readCompactSize(reader);
    if (entriesCount > MAX_ENTRIES_PER_PURPOSE) {
      throw new Error(`Too many ${purpose} addresses`);
    }
    addresses[purpose] = [];
    for (let j = 0; j < entriesCount; j++) {
      addresses[purpose].push(readNetInfoEntry(reader));
    }
  }

  return addresses;
}

/**
 * Parses serialized ExtNetInfo into the `addresses` object Core reports for it
 * @param {Buffer} buffer
 * @return {Object<string, string[]>}
 */
function extNetInfoFromBuffer(buffer) {
  const reader = new BufferReader(buffer);
  const addresses = readExtNetInfo(reader);
  if (!reader.finished()) {
    throw new Error('ExtNetInfo is followed by unexpected data');
  }
  return addresses;
}

// The context-free rules of Core's ExtNetInfo::Validate (src/evo/netinfo.cpp)

// PRIVILEGED_PORTS_THRESHOLD and the other ports of IsBadPort (src/netbase.cpp)
const PRIVILEGED_PORTS_THRESHOLD = 1023;
const BAD_PORTS = [
  1719, 1720, 1723, 2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668,
  6669, 6697, 8332, 8333, 10080, 18332, 18333,
];
// The only bad port Platform HTTPS may use (IsAllowedPlatformHTTPPort)
const PLATFORM_HTTPS_PORT = 443;
// I2P_SAM31_PORT: I2P SAM 3.1 has no ports
const I2P_PORT = 0;
const DOMAIN_MIN_LENGTH = 3;
const DOMAIN_LABEL_MAX_LENGTH = 63;
const TLDS_BAD = [
  '.mail', '.arpa', '.example', '.invalid', '.localhost', '.test', '.local', '.corp',
  '.home', '.internal', '.intranet', '.lan', '.private',
];
const TLDS_PRIVACY = ['.i2p', '.onion'];
const IPV6_DOCUMENTATION_PREFIX = Buffer.from('20010db8', 'hex');

/**
 * @param {number} port
 * @return {boolean}
 */
function isBadPort(port) {
  return (port > 0 && port <= PRIVILEGED_PORTS_THRESHOLD) || BAD_PORTS.includes(port);
}

/**
 * Core's DomainPort::ValidateDomain and ExtNetInfo::ValidateDomainPort, less the
 * port; the reader stays more lenient, like Core's deserialization
 * @param {string} domain
 * @return {boolean}
 */
function isValidDomain(domain) {
  if (domain.length < DOMAIN_MIN_LENGTH || domain.length > DOMAIN_MAX_LENGTH) {
    return false;
  }
  const labels = domain.split('.');
  return (
    labels.length >= 2 &&
    labels.every(
      (label) =>
        label.length >= 1 &&
        label.length <= DOMAIN_LABEL_MAX_LENGTH &&
        !label.startsWith('-') &&
        !label.endsWith('-'),
    ) &&
    /^[a-z]+$/.test(labels[labels.length - 1]) &&
    !TLDS_BAD.concat(TLDS_PRIVACY).some((tld) => domain.endsWith(tld))
  );
}

/**
 * Core's CNetAddr::IsValid for the addresses parseServiceHost returns
 * @param {{networkId: number, address: Buffer}} service
 * @return {boolean}
 */
function isValidServiceAddress({ networkId, address }) {
  if (networkId === BIP155_IPV4) {
    const value = address.readUInt32BE(0);
    return value !== 0 && value !== 0xffffffff;
  }
  if (networkId === BIP155_IPV6) {
    return !address.equals(Buffer.alloc(IPV6_ADDRESS_SIZE)) &&
      address.indexOf(IPV6_DOCUMENTATION_PREFIX) !== 0;
  }
  return true;
}

/**
 * Checks masternode addresses like Core does for a version 3 ProRegTx or
 * ProUpServTx: IsNetInfoTriviallyValid and the context-free parts of
 * ExtNetInfo::Validate. Left to Core because they depend on the network or
 * the node: routable addresses (RequireRoutableExternalIP), mainnet port rules
 * and which networks the node can reach (e.g. -cjdnsreachable).
 * @param {Object<string, string[]>} addresses
 * @param {Object} options
 * @param {boolean} options.evo - whether the masternode is an evonode
 * @param {boolean} options.allowEmpty - whether an empty address map is allowed
 */
function validateMasternodeAddresses(addresses, { evo, allowEmpty }) {
  // throws on anything that can't be serialized
  extNetInfoToBuffer(addresses);

  const purposes = Object.keys(addresses);
  if (purposes.length === 0) {
    if (!allowEmpty) {
      throw new Error('Expected addresses to have core_p2p entries');
    }
    return;
  }
  purposes.forEach((purpose) => {
    if (addresses[purpose].length === 0) {
      throw new Error(`Expected ${purpose} addresses to be non-empty`);
    }
  });
  if (!addresses.core_p2p) {
    throw new Error('Expected addresses to have core_p2p entries');
  }
  const hasPlatform = ['platform_p2p', 'platform_https'].map((purpose) => purpose in addresses);
  if (evo && !hasPlatform.every(Boolean)) {
    throw new Error('Expected evonode addresses to have platform_p2p and platform_https entries');
  }
  if (!evo && hasPlatform.some(Boolean)) {
    throw new Error('Expected regular masternode addresses to have no platform entries');
  }

  const allEntries = new Set();
  purposes.forEach((purpose) => {
    const hosts = new Set();
    addresses[purpose].forEach((entry) => {
      const { host, port, service } = parseEntry(entry);
      // Core compares addresses, and one IPv6 address has several spellings
      const hostKey = service
        ? `${service.networkId}:${service.address.toString('hex')}`
        : host;
      const entryKey = `${hostKey}:${port}`;
      if (allEntries.has(entryKey)) {
        throw new Error(`Duplicate address ${entry}`);
      }
      allEntries.add(entryKey);
      if (hosts.has(hostKey)) {
        throw new Error(`Duplicate ${purpose} address ${host}`);
      }
      hosts.add(hostKey);

      const isHTTPS = purpose === 'platform_https';
      if (service) {
        if (!isValidServiceAddress(service)) {
          throw new Error(`Invalid address ${entry}`);
        }
      } else {
        if (!isHTTPS) {
          throw new Error(`Expected a domain only in platform_https addresses: ${entry}`);
        }
        if (!isValidDomain(host)) {
          throw new Error(`Invalid domain ${entry}`);
        }
      }

      const validPort = service && service.networkId === BIP155_I2P
        ? port === I2P_PORT
        : port !== 0 && (!isBadPort(port) || (isHTTPS && port === PLATFORM_HTTPS_PORT));
      if (!validPort) {
        throw new Error(`Invalid port in ${entry}`);
      }
    });
  });
}

module.exports = {
  validateMasternodeAddresses,
  extNetInfoToBuffer,
  extNetInfoFromBuffer,
  readExtNetInfo,
};
