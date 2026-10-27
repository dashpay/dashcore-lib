/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var SimplifiedMNListEntry = require('../../lib/deterministicmnlist/SimplifiedMNListEntry');
var expect = require('chai').expect;
var Networks = require('../../lib/networks');

var smlEntryJSON = {
  proRegTxHash:
    '32e5ad5cf9a06eb13e0f65cb7ecde1a93ef24995d07355fac2ff05ebd5b9ddbf',
  confirmedHash:
    '0000001960431ec5a566e69f28ae0f6fa3199bd99ec527cccd02f7541d77300c',
  service: '95.183.51.146:39999',
  pubKeyOperator:
    '1326ddac1044e0219dba7dccf6b43d1deed3e897717ca06757243b02516cfa67e24026f7a317cf575b40c10e7f6bf7f0',
  votingAddress: 'yYhmQPak2w5L8KSwVw9R5wpqzPbAJ1fK7v',
  isValid: true,
  nVersion: 2,
  nType: 1,
  platformHTTPPort: 3200,
  platformNodeID: 'fe84df23e1a7f1db40e8e3fd3a4d88662bf0d89d',
};
var smlEntryHex =
  'bfddb9d5eb05ffc2fa5573d09549f23ea9e1cd7ecb650f3eb16ea0f95cade5320c30771d54f702cdcc27c59ed99b19a36f0fae289fe666a5c51e43601900000000000000000000000000ffff5fb733929c3f1326ddac1044e0219dba7dccf6b43d1deed3e897717ca06757243b02516cfa67e24026f7a317cf575b40c10e7f6bf7f087da2642cf967c493f126137d4f15e9de36b9768010100800c9dd8f02b66884d3afde3e840dbf1a7e123df84fe';
var smlEntryHash =
  'd759d01c922d253fa87413b5405aa1852c50819b655385b2c00eb52d7ba33c41';

var smlEntryWithoutAddress = {
  proRegTxHash:
    '1659e06c825212c9b11325760a18f6ea06194ec4efd603f03d8704f23d818a6f',
  confirmedHash:
    '000000000ca93e850827b361743c25c8508e6e42efaaa331cc1b54326d9fd179',
  service: '[0:0:0:0:0:0:0:0]:0',
  pubKeyOperator:
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  votingAddress: 'yUTy9Fb2ULXdgyqYtMMbuUWpFLaDgUqT3f',
  isValid: false,
  nVersion: 2,
  nType: 1,
  platformHTTPPort: 3200,
  platformNodeID: 'fe84df23e1a7f1db40e8e3fd3a4d88662bf0d89d',
};
var smlEntryWithoutAddressHex =
  '6f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce0591679d19f6d32541bcc31a3aaef426e8e50c8253c7461b32708853ea90c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000595d9f40d00a7ea5cca2502a1c5bc47706688c42000100800c9dd8f02b66884d3afde3e840dbf1a7e123df84fe';
var smlEntryWithoutAddressHash =
  '7a2c988aaca5e5eee6e6f807687db782e408568f83865e0d6157b049303b47a3';

// ExtAddr (version 3) entries from testnet block 1580498, after V24 activation
var extAddrEvoEntryJSON = {
  nVersion: 3,
  nType: 1,
  proRegTxHash:
    '763ca29ff79683e7572451311c9ca4a83cd0df930a7db19416efe5dd825c0b80',
  confirmedHash:
    '0000011023fc66244d63ec146cbd97eddea66a022e0d96ef81ce946b04112659',
  service: '162.35.243.85:19997',
  addresses: {
    core_p2p: ['162.35.243.85:19997'],
    platform_p2p: ['162.35.243.85:36656'],
    platform_https: ['162.35.243.85:1443'],
  },
  pubKeyOperator:
    'ad99da4a07542b221fa6f2335ab2a1071cad6f2dbae230fe82a619b07d039b6270632272ea7269dc5c8241eef139f57c',
  votingAddress: 'yWWWYUDHbtXiFkjyr9FTZMrYMniTjsozsU',
  isValid: true,
  platformHTTPPort: 1443,
  platformNodeID: '33d02004599c1e82a9b373de05dff62cbc0e2ec9',
};
var extAddrEvoEntryHex =
  '800b5c82dde5ef1694b17d0a93dfd03ca8a49c1c31512457e78396f79fa23c76592611046b94ce81ef960d2e026aa6deed97bd6c14ec634d2466fc231001000001030001010104a223f3554e1d0101010104a223f3558f300201010104a223f35505a3ad99da4a07542b221fa6f2335ab2a1071cad6f2dbae230fe82a619b07d039b6270632272ea7269dc5c8241eef139f57c6fc8eacf785fce62cb493c3ce335a12ff0596ff1010100c92e0ebc2cf6df05de73b3a9821e9c590420d033';
var extAddrRegularEntryJSON = {
  nVersion: 3,
  nType: 0,
  proRegTxHash:
    'e6a15d2538eaf448a585242846b2395160590516dfb66dec91405f9066746082',
  confirmedHash:
    '0000000eb1fb84fdea1f77f7e4529638e6a36ab3777f800639fce7c79c7e39c7',
  service: '78.17.70.175:19899',
  addresses: { core_p2p: ['78.17.70.175:19899'] },
  pubKeyOperator:
    'adad41e17d64581f58fcbc8dff2845a9a10c2e57db782dc5fd41a175729e59048dc3fb82d9f0620eeaac3eacadced01a',
  votingAddress: 'yTMSPoTRtP3m6YLx7HZSvH6YWaTmK8E1wP',
  isValid: true,
};
var extAddrRegularEntryHex =
  '82607466905f4091ec6db6df160559605139b246282485a548f4ea38255da1e6c7397e9cc7e7fc3906807f77b36aa3e6389652e4f7771feafd84fbb10e000000010100010101044e1146af4dbbadad41e17d64581f58fcbc8dff2845a9a10c2e57db782dc5fd41a175729e59048dc3fb82d9f0620eeaac3eacadced01a4d29551a50fabceb0c248be984667982c4b7525d010000';

describe('SimplifiedMNListEntry', function () {
  describe('constructor', function () {
    it('Should create an entry object from JSON object', function () {
      var entry = new SimplifiedMNListEntry(smlEntryJSON);
      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
    });
    it('Should create an entry object from a buffer', function () {
      var entry = new SimplifiedMNListEntry(
        Buffer.from(smlEntryHex, 'hex'),
        Networks.testnet
      );
      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
    });
    it('Should create an entry object from a hex string', function () {
      var entry = new SimplifiedMNListEntry(smlEntryHex, Networks.testnet);
      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
    });
    it('Should copy an instance if SimplifiedMNListEntry is passed', function () {
      var entry1 = new SimplifiedMNListEntry(smlEntryJSON);
      var entry2 = new SimplifiedMNListEntry(entry1);
      entry1.votingAddress = 'something';
      expect(entry2.toObject()).to.be.deep.equal(smlEntryJSON);
      expect(entry1.votingAddress).to.be.equal('something');
      expect(entry2.votingAddress).to.be.equal(
        'yYhmQPak2w5L8KSwVw9R5wpqzPbAJ1fK7v'
      );
    });
  });
  describe('fromBuffer', function () {
    it('Should be able to parse data from a buffer when ip address is present', function () {
      var entry = SimplifiedMNListEntry.fromBuffer(
        Buffer.from(smlEntryHex, 'hex'),
        Networks.testnet
      );
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(smlEntryJSON);
    });
    it('Should be able to parse data from a buffer when ip address is not present', function () {
      var entry = SimplifiedMNListEntry.fromBuffer(
        Buffer.from(smlEntryHex, 'hex'),
        Networks.testnet
      );
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(smlEntryJSON);
    });
  });
  describe('toBuffer', function () {
    it('Should serialize data to same buffer', function () {
      var entry = new SimplifiedMNListEntry(smlEntryJSON);
      var entryBuffer = entry.toBuffer();
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(smlEntryJSON);
      expect(entryBuffer.toString('hex')).to.be.equal(smlEntryHex);
    });
    it('Should serialize data to same buffer if ip address is not present', function () {
      var entry = new SimplifiedMNListEntry(smlEntryWithoutAddress);
      var entryBuffer = entry.toBuffer();
      var entryJSON = entry.toObject();
      var entryString = entryBuffer.toString('hex');
      expect(entryJSON).to.be.deep.equal(smlEntryWithoutAddress);
      expect(entryString).to.be.equal(smlEntryWithoutAddressHex);
    });
    it('Buffer size should always be the same', function () {
      var entryWithDifferentKeys = new SimplifiedMNListEntry(
        smlEntryJSON
      ).toBuffer();
      var entryWithSameKeys = new SimplifiedMNListEntry(
        smlEntryJSON
      ).toBuffer();
      var entryWithNoAddress = new SimplifiedMNListEntry(
        smlEntryWithoutAddress
      ).toBuffer();

      expect(entryWithSameKeys.length).to.be.equal(
        entryWithDifferentKeys.length
      );
      expect(entryWithNoAddress.length).to.be.equal(
        entryWithDifferentKeys.length
      );
    });
  });
  describe('fromObject', function () {
    it('Should create an instance from a JSONObject', function () {
      var entry = SimplifiedMNListEntry.fromObject(smlEntryJSON);

      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
      expect(entry.toBuffer().toString('hex')).to.be.equal(smlEntryHex);
    });
  });
  describe('toObject', function () {
    it('Should serialize SMLEntry to JSON object', function () {
      var entry = new SimplifiedMNListEntry(smlEntryHex, Networks.testnet);

      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
    });
  });
  describe('fromHexString', function () {
    it('Should be able to create an entry from a hex string', function () {
      var entry = SimplifiedMNListEntry.fromHexString(
        smlEntryHex,
        Networks.testnet
      );

      expect(entry.toObject()).to.be.deep.equal(smlEntryJSON);
    });
  });
  describe('calculateHash', function () {
    it('Should get correct hash for an entry with ip address', function () {
      var entry = new SimplifiedMNListEntry(smlEntryJSON);
      var serialized = entry.toBuffer().toString('hex');
      expect(serialized.length).to.be.equal(smlEntryHex.length);
      expect(entry.toBuffer().toString('hex')).to.be.equal(smlEntryHex);
      expect(entry.calculateHash().toString('hex')).to.be.equal(smlEntryHash);
    });
    it('Should get correct hash for an entry without ip address', function () {
      var entry = new SimplifiedMNListEntry(smlEntryWithoutAddress);
      var serialized = entry.toBuffer().toString('hex');
      expect(serialized.length).to.be.equal(smlEntryWithoutAddressHex.length);
      expect(entry.toBuffer().toString('hex')).to.be.equal(
        smlEntryWithoutAddressHex
      );
      expect(entry.calculateHash().toString('hex')).to.be.equal(
        smlEntryWithoutAddressHash
      );
    });
  });
  describe('ExtAddr entries', function () {
    it('Should serialize addresses as ExtNetInfo and skip platformHTTPPort', function () {
      var entry = new SimplifiedMNListEntry(extAddrEvoEntryJSON);
      expect(entry.toBuffer().toString('hex')).to.be.equal(extAddrEvoEntryHex);
      expect(entry.toObject()).to.be.deep.equal(extAddrEvoEntryJSON);
    });
    it('Should serialize a regular ExtAddr entry', function () {
      var entry = new SimplifiedMNListEntry(extAddrRegularEntryJSON);
      expect(entry.toBuffer().toString('hex')).to.be.equal(extAddrRegularEntryHex);
    });
    it('Should take service and platformHTTPPort from addresses when Core omits them', function () {
      var json = Object.assign({}, extAddrEvoEntryJSON);
      delete json.service;
      delete json.platformHTTPPort;
      var entry = new SimplifiedMNListEntry(json);
      expect(entry.service).to.be.equal('162.35.243.85:19997');
      expect(entry.platformHTTPPort).to.be.equal(1443);
      expect(entry.getIp()).to.be.equal('162.35.243.85');
      expect(entry.toBuffer().toString('hex')).to.be.equal(extAddrEvoEntryHex);
    });
    it('Should serialize a revoked ExtAddr entry with empty addresses', function () {
      var json = Object.assign({}, extAddrRegularEntryJSON, { addresses: {} });
      delete json.service;
      var entry = new SimplifiedMNListEntry(json);
      // ExtNetInfo version 1 with no purposes follows the confirmed hash
      expect(entry.toBuffer().toString('hex').slice(128, 132)).to.be.equal('0100');
      expect(entry.service).to.be.equal('[0:0:0:0:0:0:0:0]:0');
    });
    it('Should not share addresses with toObject() results', function () {
      var entry = new SimplifiedMNListEntry(extAddrEvoEntryJSON);
      entry.toObject().addresses.core_p2p.push('1.2.3.4:9999');
      expect(entry.toBuffer().toString('hex')).to.be.equal(extAddrEvoEntryHex);
    });
    it('Should reject an ExtAddr entry without addresses', function () {
      var json = Object.assign({}, extAddrRegularEntryJSON);
      delete json.addresses;
      expect(function () {
        return new SimplifiedMNListEntry(json);
      }).to.throw('Expected addresses to be an object');
    });
  });
  describe('getIp', function () {
    it('Should get the ip address', function () {
      var entry = new SimplifiedMNListEntry(smlEntryJSON);
      var ip = entry.getIp();
      expect(ip).to.be.equal('95.183.51.146');
    });
  });
});
