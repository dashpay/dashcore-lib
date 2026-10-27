const { expect } = require('chai');
const { extNetInfoToBuffer } = require('../../lib/util/netinfo');

// Expected bytes follow Core's ExtNetInfo / NetInfoEntry serialization
// (src/evo/netinfo.h): version, purpose map, then per entry a type byte and
// either a BIP155 address + big endian port or a domain string + port.
describe('netinfo', () => {
  describe('extNetInfoToBuffer', () => {
    it('should serialize an empty address map', () => {
      expect(extNetInfoToBuffer({}).toString('hex')).to.equal('0100');
    });

    it('should serialize an IPv4 service', () => {
      const buffer = extNetInfoToBuffer({ core_p2p: ['1.2.3.4:9999'] });
      // version, purposes, core_p2p, entries, service, IPv4, length, address, port
      expect(buffer.toString('hex')).to.equal('01' + '01' + '00' + '01' + '01' + '01' + '04' + '01020304' + '270f');
    });

    it('should serialize purposes in ascending order regardless of key order', () => {
      const buffer = extNetInfoToBuffer({
        platform_https: ['1.2.3.4:443'],
        core_p2p: ['1.2.3.4:9999'],
        platform_p2p: ['1.2.3.4:26656'],
      });
      expect(buffer.toString('hex')).to.equal(
        '01' + '03'
        + '00' + '01' + '01010401020304' + '270f'
        + '01' + '01' + '01010401020304' + '6820'
        + '02' + '01' + '01010401020304' + '01bb',
      );
    });

    it('should serialize several entries of one purpose in order', () => {
      const buffer = extNetInfoToBuffer({ core_p2p: ['1.2.3.4:9999', '5.6.7.8:9999'] });
      expect(buffer.toString('hex')).to.equal(
        '01' + '01' + '00' + '02' + '01010401020304' + '270f' + '01010405060708' + '270f',
      );
    });

    it('should serialize IPv6 and CJDNS services', () => {
      expect(extNetInfoToBuffer({ core_p2p: ['[2001:db8::1]:9999'] }).toString('hex'))
        .to.equal('0101000101' + '02' + '10' + '20010db8000000000000000000000001' + '270f');
      expect(extNetInfoToBuffer({ core_p2p: ['[fc00::1]:9999'] }).toString('hex'))
        .to.equal('0101000101' + '06' + '10' + 'fc000000000000000000000000000001' + '270f');
    });

    it('should serialize Tor v3 and I2P services', () => {
      const pubKey = Buffer.from(Array.from({ length: 32 }, (_, i) => i)).toString('hex');
      const i2pHash = Buffer.from(Array.from({ length: 32 }, (_, i) => i + 32)).toString('hex');

      expect(extNetInfoToBuffer({
        core_p2p: ['aaaqeayeaudaocajbifqydiob4ibceqtcqkrmfyydenbwha5dyp3kead.onion:9999'],
      }).toString('hex')).to.equal('0101000101' + '04' + '20' + pubKey + '270f');
      expect(extNetInfoToBuffer({
        core_p2p: ['eaqseizeeutcokbjfivsyljof4ydcmrtgq2tmnzyhe5dwpb5hy7q.b32.i2p:0'],
      }).toString('hex')).to.equal('0101000101' + '05' + '20' + i2pHash + '0000');
    });

    it('should serialize a domain', () => {
      const buffer = extNetInfoToBuffer({ platform_https: ['example.com:443'] });
      expect(buffer.toString('hex')).to.equal(
        '01' + '01' + '02' + '01' + '02' + '0b' + Buffer.from('example.com').toString('hex') + '01bb',
      );
    });

    it('should reject unknown purposes and malformed entries', () => {
      expect(() => extNetInfoToBuffer({ unknown: [] })).to.throw('Unknown address purpose');
      expect(() => extNetInfoToBuffer({ core_p2p: '1.2.3.4:9999' })).to.throw('to be an array');
      expect(() => extNetInfoToBuffer({ core_p2p: ['1.2.3.4'] })).to.throw('Invalid address entry');
      expect(() => extNetInfoToBuffer({ core_p2p: ['1.2.3.4:0x10'] })).to.throw('Invalid address entry');
      expect(() => extNetInfoToBuffer({ platform_https: ['Example.com:443'] })).to.throw('Invalid address entry');
      expect(() => extNetInfoToBuffer({ core_p2p: ['[2001:db8::1::2]:9999'] })).to.throw('Invalid IPv6');
      expect(() => extNetInfoToBuffer({ core_p2p: ['aaaa.onion:9999'] })).to.throw('Invalid Tor v3');
    });
  });
});
