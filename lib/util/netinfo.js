const BufferWriter = require('../encoding/bufferwriter');

// Serialization of Dash Core's ExtNetInfo (src/evo/netinfo.h), the address
// format of ExtAddr (version 3) masternode entries.

const EXT_NET_INFO_VERSION = 1;

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

const TORV3_ADDRESS_SIZE = 32;
const TORV3_VERSION = 3;
const I2P_ADDRESS_SIZE = 32;

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
  return Buffer.from(bytes);
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
  const buffer = Buffer.alloc(16);
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
    // Core prints CJDNS addresses like IPv6. Mainnet and testnet reject unroutable
    // fc00::/8 IPv6, so there it is always CJDNS (regtest may store it as IPv6).
    return {
      networkId: address[0] === 0xfc ? BIP155_CJDNS : BIP155_IPV6,
      address,
    };
  }
  if (host.endsWith('.onion')) {
    // base32(pubkey || checksum[2] || version[1])
    const decoded = decodeBase32(host.replace(/\.onion$/, ''));
    const version = decoded[decoded.length - 1];
    if (decoded.length !== TORV3_ADDRESS_SIZE + 3 || version !== TORV3_VERSION) {
      throw new Error(`Invalid Tor v3 address ${host}`);
    }
    return { networkId: BIP155_TORV3, address: decoded.slice(0, TORV3_ADDRESS_SIZE) };
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
    if (!DOMAIN_REGEX.test(host)) {
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
    writer.writeUInt8(PURPOSES.indexOf(purpose));
    writer.writeVarintNum(entries.length);
    entries.forEach((entry) => writeNetInfoEntry(writer, entry));
  });

  return writer.toBuffer();
}

module.exports = {
  extNetInfoToBuffer,
};
