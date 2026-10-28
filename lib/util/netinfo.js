const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');

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
const DOMAIN_REGEX = /^[a-z0-9.-]+$/;
const IPV4_REGEX =
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

/**
 * @param {string} string - unpadded lowercase RFC 4648 base32
 * @return {Buffer}
 */
function decodeBase32(string) {
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
  if (missing < 0 || (halves.length === 1 && missing !== 0)) {
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
      networkId: address[0] === 0xfc ? BIP155_CJDNS : BIP155_IPV6,
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
 * Serializes one NetInfoEntry from its "addr:port" JSON form
 * @param {BufferWriter} writer
 * @param {string} entry
 */
function writeNetInfoEntry(writer, entry) {
  const separator = entry.lastIndexOf(':');
  const host = entry.slice(0, separator);
  const portString = entry.slice(separator + 1);
  const port = Number(portString);
  if (separator <= 0 || !/^[0-9]{1,5}$/.test(portString) || port > 0xffff) {
    throw new Error(`Invalid address entry ${entry}`);
  }

  const service = parseServiceHost(host);
  if (service) {
    writer.writeUInt8(ENTRY_TYPE_SERVICE);
    writer.writeUInt8(service.networkId);
    writer.writeVarintNum(service.address.length);
    writer.write(service.address);
  } else {
    if (!DOMAIN_REGEX.test(host) || host.length > DOMAIN_MAX_LENGTH) {
      throw new Error(`Invalid address entry ${entry}`);
    }
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
    if (!Array.isArray(entries)) {
      throw new Error(`Expected ${purpose} addresses to be an array`);
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
    const size = reader.readVarintNum();
    if (BIP155_ADDRESS_SIZES[networkId] !== size) {
      throw new Error(`Invalid BIP155 address of network ${networkId} and size ${size}`);
    }
    const address = reader.read(size);
    return serviceToString(networkId, address, reader.readUInt16BE());
  }
  if (type === ENTRY_TYPE_DOMAIN) {
    const size = reader.readVarintNum();
    if (size > DOMAIN_MAX_LENGTH) {
      throw new Error(`Domain of ${size} bytes is too long`);
    }
    const domain = reader.read(size).toString('ascii');
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
  const purposesCount = reader.readVarintNum();
  let previousCode = -1;
  for (let i = 0; i < purposesCount; i++) {
    const code = reader.readUInt8();
    // Core requires known purposes in ascending order
    if (code >= PURPOSES.length || code <= previousCode) {
      throw new Error(`Address purpose ${code} is unknown or out of order`);
    }
    previousCode = code;

    const purpose = PURPOSES[code];
    const entriesCount = reader.readVarintNum();
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

module.exports = {
  extNetInfoToBuffer,
  extNetInfoFromBuffer,
  readExtNetInfo,
};
