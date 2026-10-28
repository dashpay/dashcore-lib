const { expect } = require('chai');
const BufferReader = require('../../lib/encoding/bufferreader');
const {
  extNetInfoToBuffer,
  extNetInfoFromBuffer,
  readExtNetInfo,
} = require('../../lib/util/netinfo');

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
      // IPv6 forms Core reads as IPv4, Tor v2 or internal addresses
      ['[::ffff:102:304]:9999', '[fd87:d87e:eb43::1]:9999', '[fd6b:88c0:8724::1]:9999'].forEach((entry) => {
        expect(() => extNetInfoToBuffer({ core_p2p: [entry] })).to.throw('Invalid IPv6 address');
      });
      // DOMAIN_MAX_LEN is 253 characters
      const label = 'a'.repeat(63);
      const domain253 = [label, label, label, 'a'.repeat(61)].join('.');
      expect(domain253).to.have.lengthOf(253);
      expect(extNetInfoFromBuffer(extNetInfoToBuffer({ platform_https: [`${domain253}:443`] })))
        .to.deep.equal({ platform_https: [`${domain253}:443`] });
      expect(() => extNetInfoToBuffer({ platform_https: [`${domain253}aa:443`] }))
        .to.throw('Invalid address entry');
      // a valid address with the last checksum character changed
      expect(() => extNetInfoToBuffer({
        core_p2p: ['pg6mmjiyjmcrsslvykfwnntlaru7p5svn6y2ymmju6nubxndf4pscsyd.onion:9999'],
      })).to.throw('Invalid Tor v3 address');
      // the last character of a 52 character I2P address carries 4 unused bits
      expect(() => extNetInfoToBuffer({
        core_p2p: ['eaqseizeeutcokbjfivsyljof4ydcmrtgq2tmnzyhe5dwpb5hy7r.b32.i2p:0'],
      })).to.throw('Non-canonical base32');
      expect(() => extNetInfoToBuffer({
        platform_https: ['1.2.3.1:443', '1.2.3.2:443', '1.2.3.3:443', '1.2.3.4:443', '1.2.3.5:443'],
      })).to.throw('Too many platform_https addresses');
    });
  });

  describe('extNetInfoFromBuffer', () => {
    it('should read every address kind in Core\'s string form', () => {
      // Entries as Core v24 reports them: Tor, I2P and domain from rpc_netinfo.py;
      // the IPv6 and CJDNS ones decoded by Core from an rpc_netinfo.py
      // ProUpServTx with its [::1] entry replaced
      const addresses = {
        core_p2p: [
          '127.0.0.1:19951',
          'kpgvmscirrdqpekbqjsvw5teanhatztpp2gl6eee4zkowvwfxwenqaid.onion:19951',
          '[2a01:4f8::1]:19951',
          '[fc00::1]:19951',
        ],
        platform_p2p: ['c4gfnttsuwqomiygupdqqqyy5y5emnk5c73hrfvatri67prd7vyq.b32.i2p:0'],
        platform_https: ['server-1.example.com:22201'],
      };
      const buffer = extNetInfoToBuffer(addresses);

      expect(extNetInfoFromBuffer(buffer)).to.deep.equal(addresses);
    });

    it('should read an empty address map', () => {
      expect(extNetInfoFromBuffer(Buffer.from('0100', 'hex'))).to.deep.equal({});
    });

    it('should compress IPv6 addresses like Core', () => {
      // one core_p2p IPv6 service on port 9999
      const read = (hex) => extNetInfoFromBuffer(
        Buffer.from('0101000101' + '02' + '10' + hex + '270f', 'hex'),
      ).core_p2p[0];

      expect(read('00000000000000000000000000000001')).to.equal('[::1]:9999');
      expect(read('20010db8000000000000000000000000')).to.equal('[2001:db8::]:9999');
      // a single zero group is not compressed
      expect(read('20010db8000100010001000100000001')).to.equal('[2001:db8:1:1:1:1:0:1]:9999');
      // the first of two equally long zero runs is compressed
      expect(read('20010db8000000000001000000000001')).to.equal('[2001:db8::1:0:0:1]:9999');
      // the longest zero run is compressed
      expect(read('20010000000100000000000000000001')).to.equal('[2001:0:1::1]:9999');
    });

    it('should leave a BufferReader after the ExtNetInfo', () => {
      const reader = new BufferReader(Buffer.concat([
        extNetInfoToBuffer({ core_p2p: ['1.2.3.4:9999'] }),
        Buffer.from('ff', 'hex'),
      ]));

      expect(readExtNetInfo(reader)).to.deep.equal({ core_p2p: ['1.2.3.4:9999'] });
      expect(reader.readUInt8()).to.equal(0xff);
      expect(reader.finished()).to.equal(true);
    });

    it('should reject input Core would not read back as the same addresses', () => {
      const entry = (hex) => Buffer.from(`01010001${hex}`, 'hex');

      expect(() => extNetInfoFromBuffer(Buffer.from('0200', 'hex'))).to.throw('Unsupported ExtNetInfo version 2');
      expect(() => extNetInfoFromBuffer(Buffer.from('010103', 'hex'))).to.throw('unknown or out of order');
      expect(() => extNetInfoFromBuffer(Buffer.from('0102010000', 'hex'))).to.throw('unknown or out of order');
      expect(() => extNetInfoFromBuffer(Buffer.from('01010005', 'hex'))).to.throw('Too many core_p2p addresses');
      expect(() => extNetInfoFromBuffer(entry('ff'))).to.throw('Unknown address entry type 255');
      expect(() => extNetInfoFromBuffer(entry('010303'))).to.throw('Invalid BIP155 address of network 3');
      expect(() => extNetInfoFromBuffer(entry('01010501020304'))).to.throw('Invalid BIP155 address of network 1 and size 5');
      expect(() => extNetInfoFromBuffer(entry(`010210${'00000000000000000000ffff01020304'}270f`)))
        .to.throw('Invalid IPv6 address');
      expect(() => extNetInfoFromBuffer(entry(`0203${Buffer.from('A.b').toString('hex')}01bb`)))
        .to.throw('Invalid domain');
      expect(() => extNetInfoFromBuffer(entry('02fdfe00'))).to.throw('too long');
      expect(() => extNetInfoFromBuffer(Buffer.concat([extNetInfoToBuffer({}), Buffer.from('00', 'hex')])))
        .to.throw('ExtNetInfo is followed by unexpected data');
    });
  });
});
