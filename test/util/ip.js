/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var expect = require('chai').expect;
var ip = require('../../lib/util/ip');
var constants = require('../../lib/constants');

describe('ip', function () {
  describe('#ipAndPortToBuffer', function () {
    it('Should serialize ip and port to a buffer', function () {
      // c0a80001 - 192.168.0.1 as a hex string, 1771 is 6001 as UInt16BE
      var expectedBuffer = Buffer.from(
        '00000000000000000000ffffc0a800011771',
        'hex'
      );
      var addressBuffer = ip.ipAndPortToBuffer('192.168.0.1:6001');
      var string = addressBuffer.toString('hex');

      // 16 for ipv6, and 2 bytes for the port
      expect(addressBuffer.length).to.be.equal(18);
      expect(addressBuffer).to.be.deep.equal(expectedBuffer);
    });
    it('Should accept only zero ipv6, if ipv6 is passed as an arg, as implemented in dashcore', function () {
      var zeroaddressBuffer = ip.ipAndPortToBuffer(
        constants.EMPTY_IPV6_ADDRESS
      );
      expect(zeroaddressBuffer.length).to.be.equal(18);
      expect(zeroaddressBuffer).to.be.deep.equal(Buffer.alloc(18));
      expect(ip.ipAndPortToBuffer.bind(this, '[0:0:0:fa:0:0:0:0]:0')).to.throw(
        'Only serialization of ipv4 and zero ipv6 is allowed'
      );
    });
    it('Should throw if a value that is not isv4 or zero ipv6 string is passed', function () {
      expect(ip.ipAndPortToBuffer.bind(this, 'some string')).to.throw(
        'Only serialization of ipv4 and zero ipv6 is allowed'
      );
      expect(ip.ipAndPortToBuffer.bind(this, 2)).to.throw(
        'Only serialization of ipv4 and zero ipv6 is allowed'
      );
      expect(ip.ipAndPortToBuffer.bind(this, {})).to.throw(
        'Only serialization of ipv4 and zero ipv6 is allowed'
      );
      expect(ip.ipAndPortToBuffer.bind(this, '361.862.192.51:800')).to.throw(
        'Only serialization of ipv4 and zero ipv6 is allowed'
      );
    });
  });

  describe('#bufferToIpAndPort', function () {
    it('Should parse ip and port serialized to a binary', function () {
      var expectedAddressString = '192.168.0.1:6001';
      // c0a80001 - 192.168.0.1 as a hex string, 1771 is 6001 as UInt16BE
      var ipAndPortBuffer = Buffer.from(
        '000000000000000000000000c0a800011771',
        'hex'
      );

      var addressString = ip.bufferToIPAndPort(ipAndPortBuffer);
      expect(addressString).to.be.equal(expectedAddressString);
    });
    it('Should return zero ipv6 if hex is zero, as it works in dashcore', function () {
      var zeroBuffer = Buffer.alloc(18);
      var ipAndPort = ip.bufferToIPAndPort(zeroBuffer);
      expect(ipAndPort).to.be.equal(constants.EMPTY_IPV6_ADDRESS);
    });
    it('Should throw if buffer size is different from ip and port size', function () {
      expect(ip.bufferToIPAndPort.bind(this, Buffer.alloc(19))).to.throw(
        'Ip buffer has wrong size. Expected size is 18 bytes'
      );
      expect(ip.bufferToIPAndPort.bind(this, Buffer.alloc(17))).to.throw(
        'Ip buffer has wrong size. Expected size is 18 bytes'
      );
    });
  });
});
