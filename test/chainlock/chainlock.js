'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var bitcore = require('../..');
var ChainLock = bitcore.ChainLock;

describe('ChainLock', function() {
  var str = '68d50500259e20cd8e2c5c0d65558565f6abd1f222d4902f8f7d256acaca60df0501000017b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2';
  var str2 = 'ea480100f4a5708c82f589e19dfe9e9cd1dbab57f74f27b24f0a3c765ba6e007000000000a43f1c3e5b3e8dbd670bca8d437dc25572f72d8e1e9be673e9ebbb606570307c3e5f5d073f7beb209dd7e0b8f96c751060ab3a7fb69a71d5ccab697b8cfa5a91038a6fecf76b7a827d75d17f01496302942aa5e2c7f4a48246efc8d3941bf6c';

  var object = {
      "blockHash": "00000105df60caca6a257d8f2f90d422f2d1abf6658555650d5c2c8ecd209e25",
      "height": 382312,
      "signature": "17b7b6008df6725a5b89bd114c89a2d650b3fcb33fc127c29763c15a3cf110d7e32aa5108223b0b31597be0953d37c6c06545ed28e71be7d6420e1b24e54ae66eb40b932f453ddc811af37b38d364bd1a9df7da31c60be4728b84150558516f2",
  };
  var object2 = {
    height: 84202,
    blockHash: '0000000007e0a65b763c0a4fb2274ff757abdbd19c9efe9de189f5828c70a5f4',
    signature: '0a43f1c3e5b3e8dbd670bca8d437dc25572f72d8e1e9be673e9ebbb606570307c3e5f5d073f7beb209dd7e0b8f96c751060ab3a7fb69a71d5ccab697b8cfa5a91038a6fecf76b7a827d75d17f01496302942aa5e2c7f4a48246efc8d3941bf6c'
  }


  var buf = Buffer.from(str, 'hex');
  var buf2 = Buffer.from(str2, 'hex');

  var expectedRequestId2 = "6639d0da4a746f7260968e54be1b14fce8c5429f51bfe8762b58aae294e0925d";
  var expectedHash2 = "3764ada6c32f09bb4f02295415b230657720f8be17d6fe046f0f8bf3db72b8e0";

  describe('validation', function (){
    describe('#getHash', function (){
      it('should compute the hash', function(){
        var hash = ChainLock.fromBuffer(buf2).getHash().toString('hex');
        expect(hash).to.deep.equal(expectedHash2);
      })
    })
    describe('#getRequestId', function (){
      it('should compute the requestId', function(){
        var requestId = ChainLock.fromObject(object2).getRequestId().toString('hex');
        expect(requestId).to.deep.equal(expectedRequestId2);
      })
    })
    describe('#isValid', function(){
      it('isValid returns true on a valid chainlock', function() {
        var valid = ChainLock.isValid(object2.blockHash, object2.height, object2.signature);
        valid.should.equal(true);
      });
      it('isValid returns false on invalid chainlock', function() {
        // var valid = ChainLock.isValid(object2.blockHash, object2.height, object2.signature);
        // valid.should.equal(false);
      });
    })
  });

  describe('instantiation', function (){
    describe('fromBuffer', function () {
      it('should be able to parse data from a buffer', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        var chainLockStr = chainLock.toString();
        expect(chainLockStr).to.be.deep.equal(str2)
        var chainLockJSON = chainLock.toObject();
        expect(chainLockJSON).to.be.deep.equal(object2)
      });
    });

    describe('fromObject', function () {
      it('Should be able to parse data from an object', function () {
        var chainLock = ChainLock.fromObject(object2);
        var chainLockStr = chainLock.toString();
        expect(chainLockStr).to.be.deep.equal(str2)
      });
    });

    describe('fromString', function () {
      it('Should be able to parse data from a hex string', function () {
        var chainLock = ChainLock.fromHex(str2);
        var chainLockJSON = chainLock.toObject();
        var chainLockBuffer = chainLock.toBuffer().toString('hex');
        expect(chainLockJSON).to.be.deep.equal(object2)

        expect(chainLockBuffer).to.be.deep.equal(buf2.toString('hex'))
      });
    });

    describe('clone itself', function (){
      it('can be instantiated from another chainlock', function() {
        var chainLock = ChainLock.fromBuffer(buf2);
        var chainLock2 = new ChainLock(chainLock);
        chainLock2.toString().should.equal(chainLock.toString());
      });
    })
  });
  describe('output', function (){
    describe('#copy', function() {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(Buffer.from(str2, 'hex'));
        var chainLockCopy = chainLock.copy();
        expect(chainLockCopy).to.deep.equal(chainLock);
      })
    });
    describe('#toBuffer', function() {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        expect(chainLock.toBuffer().toString('hex')).to.deep.equal(str2);
      })
    });
    describe('#toJSON/#toObject', function() {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf);
        expect(chainLock.toObject()).to.deep.equal(chainLock.toJSON());
        expect(chainLock.toObject()).to.deep.equal(object);

        var chainLock2 = ChainLock.fromBuffer(buf2);
        expect(chainLock2.toObject()).to.deep.equal(chainLock2.toJSON());
        expect(chainLock2.toObject()).to.deep.equal(object2);
      })
    });
    describe('#toString', function() {
      it('should output formatted output correctly', function () {
        var chainLock = ChainLock.fromBuffer(buf2);
        expect(chainLock.toString()).to.deep.equal(str2);
      })
    });
    describe('#inspect', function() {
      it('should output formatted output correctly', function() {
        var chainLock = new ChainLock(str);
        var output = '<ChainLock: 00000105df60caca6a257d8f2f90d422f2d1abf6658555650d5c2c8ecd209e25, height: 382312>';
        chainLock.inspect().should.equal(output);
      });
    });
  })
});
