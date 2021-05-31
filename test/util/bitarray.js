/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit
var expect = require('chai').expect;
var merkleTreeUtil = require('../../lib/util/bitarray');

describe('BitArray', function () {
  describe('.convertBitArrayToUInt8Array', function () {
    it('Should convert bit array to byte array', function () {
      var byteArray = merkleTreeUtil.convertBitArrayToUInt8Array([
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(byteArray).to.be.deep.equal([255]);

      byteArray = merkleTreeUtil.convertBitArrayToUInt8Array([
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(byteArray).to.be.deep.equal([127]);
    });
    it('Should add leading zeros to incomplete bytes ', function () {
      var byteArray = merkleTreeUtil.convertBitArrayToUInt8Array([
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(byteArray).to.be.deep.equal([128, 127, 255, 1]);
    });
    it("Should throw if passed value isn't a bit array", function () {
      expect(function () {
        merkleTreeUtil.convertBitArrayToUInt8Array([125]);
      }).to.throw('Argument is not a bit array');
      expect(function () {
        merkleTreeUtil.convertBitArrayToUInt8Array('string');
      }).to.throw('Argument is not a bit array');
    });
  });
});
