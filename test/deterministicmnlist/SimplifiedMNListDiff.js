/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var SimplifiedMNListDiff = require('../../lib/deterministicmnlist/SimplifiedMNListDiff');
var SMNListFixture = require('../fixtures/mnList');
var expect = require('chai').expect;
var sinon = require('sinon');
var Networks = require('../../lib/networks');
var BlockHeader = require('../../lib/block/blockheader');
var MerkleBlock = require('../../lib/block/merkleblock');
var SimplifiedMNList = require('../../lib/deterministicmnlist/SimplifiedMNList');

var coreDiffs = require('../fixtures/core-p2p-mnlistdiffs.json');
// Core's RPC JSON for the same testnet diffs as coreDiffs.testnetFull and the
// one block after it
var coreDiffsJSON = require('../fixtures/core24-testnet-mnlistdiffs.json');
var mnListDiffHexString = coreDiffs.testnetIncremental.hex;
var mnListDiffJSON = SMNListFixture.getSecondDiff();

describe('SimplifiedMNListDiff', function () {
  describe('constructor', function () {
    it('Should call .fromObject method, if an object is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromObject');

      var diff = new SimplifiedMNListDiff(mnListDiffJSON);

      expect(SimplifiedMNListDiff.fromObject.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromObject.calledWith(mnListDiffJSON)).to.be
        .true;

      SimplifiedMNListDiff.fromObject.restore();
    });
    it('Should call .fromBuffer method, if a buffer is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromBuffer');
      var buff = Buffer.from(mnListDiffHexString, 'hex');
      var buff2 = Buffer.from(buff);

      var diff = new SimplifiedMNListDiff(buff);

      expect(SimplifiedMNListDiff.fromBuffer.callCount).to.be.equal(1);
      // expect(SimplifiedMNListDiff.fromBuffer.args[0][0]).to.be.deep.equal(Buffer.from(mnListDiffHexString, 'hex'));
      expect(SimplifiedMNListDiff.fromBuffer.calledWithMatch(buff2)).to.be.true;

      SimplifiedMNListDiff.fromBuffer.restore();
    });
    it('Should call .fromHexString method, if a hex string is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromHexString');

      var diff = new SimplifiedMNListDiff(mnListDiffHexString);

      expect(SimplifiedMNListDiff.fromHexString.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromHexString.calledWith(mnListDiffHexString))
        .to.be.true;

      SimplifiedMNListDiff.fromHexString.restore();
    });
    it('Should call a copy method of passed instance, if instance is passed', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      sinon.spy(instance, 'copy');

      var copy = new SimplifiedMNListDiff(instance);

      expect(instance.copy.callCount).to.be.equal(1);
      copy.baseBlockHash =
        '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);

      instance.copy.restore();
    });
    it('Should throw an error if argument is not a hex string, buffer or object', function () {
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 2)).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
      expect(
        SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 'not a hex string')
      ).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, true)).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
    });
  });
  describe('fromObject', function () {
    it('Should be able to create an instance from object', function () {
      var diff = SimplifiedMNListDiff.fromObject(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
    it('Should be able to create an instance from object with specified network', function () {
      var diff = SimplifiedMNListDiff.fromObject(mnListDiffJSON, 'testnet');
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('toObject', function () {
    it('Should return an object with serialized diff data', function () {
      var diff = new SimplifiedMNListDiff(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('fromBuffer', function () {
    it('Should not modify the buffer it parses', function () {
      var buf = Buffer.from(mnListDiffHexString, 'hex');

      SimplifiedMNListDiff.fromBuffer(buf, Networks.testnet);

      expect(buf.toString('hex')).to.be.equal(mnListDiffHexString);
    });
    it('Should throw if the buffer has data after the diff', function () {
      expect(function () {
        SimplifiedMNListDiff.fromHexString(mnListDiffHexString + '00', 'testnet');
      }).to.throw('MnListDiff is followed by unexpected data');
    });
    describe('with a crafted quorum bit set size', function () {
      // the first new quorum is a version 3 llmq_50_60 commitment: version (2 bytes),
      // llmqType (1), quorumHash (32), then the signers bit set size, 0x32 (50)
      var quorumStart;
      var hugeSize = 'ff0000000000002000'; // 2^53 bits

      before(function () {
        var diff = SimplifiedMNListDiff.fromHexString(mnListDiffHexString, 'testnet');
        quorumStart = mnListDiffHexString.indexOf(
          diff.newQuorums[0].toBufferForHashing().toString('hex')
        );
        expect(mnListDiffHexString.substr(quorumStart + 4, 2)).to.be.equal('01');
        expect(mnListDiffHexString.substr(quorumStart + 70, 2)).to.be.equal('32');
      });

      function craft(llmqType, size) {
        return mnListDiffHexString.slice(0, quorumStart + 4) + llmqType
          + mnListDiffHexString.slice(quorumStart + 6, quorumStart + 70) + size
          + mnListDiffHexString.slice(quorumStart + 72);
      }

      it('Should throw if it differs from the size of a known quorum type', function () {
        this.timeout(2000);
        [hugeSize, '31'].forEach(function (size) {
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craft('01', size), 'testnet');
          }).to.throw('Expected a bit set of 50 bits, got');
        });
      });
      it('Should throw if it is longer than the data of an unknown quorum type', function () {
        this.timeout(2000);
        expect(function () {
          SimplifiedMNListDiff.fromHexString(craft('c8', hugeSize), 'testnet');
        }).to.throw('Bit set of 9007199254740992 bits is longer than the remaining data');
      });
    });
  });
  describe('toBuffer', function () {
    it('Should serialize a diff from Core RPC so that fromBuffer reads it back', function () {
      var buf = new SimplifiedMNListDiff(mnListDiffJSON).toBuffer();
      var diff = SimplifiedMNListDiff.fromBuffer(buf, Networks.testnet);

      expect(diff.toBuffer()).to.be.deep.equal(buf);
      expect(diff.toObject()).to.be.deep.equal(
        Object.assign({}, mnListDiffJSON, { quorumsCLSigs: [] })
      );
    });
  });
  describe('Core P2P mnlistdiff messages', function () {
    Object.keys(coreDiffs).filter(function (name) {
      return name !== 'note';
    }).forEach(function (name) {
      var vector = coreDiffs[name];

      describe(name + ' (' + vector.baseHeight + ' to ' + vector.height + ')', function () {
        var diff;

        before(function () {
          diff = SimplifiedMNListDiff.fromHexString(vector.hex, vector.network);
        });

        it('Should serialize back to the same bytes', function () {
          expect(diff.toBuffer().toString('hex')).to.be.equal(vector.hex);
        });
        it('Should round-trip through toObject and fromObject', function () {
          var copy = SimplifiedMNListDiff.fromObject(diff.toObject(), vector.network);
          expect(copy.toBuffer().toString('hex')).to.be.equal(vector.hex);
        });
        it('Should round-trip through JSON.stringify and fromJSON', function () {
          var copy = SimplifiedMNListDiff.fromJSON(JSON.parse(JSON.stringify(diff)));
          expect(copy.toBuffer().toString('hex')).to.be.equal(vector.hex);
        });
        it('Should prove the coinbase is in the diff block', function () {
          var header = BlockHeader.fromString(vector.blockHeader);
          // a merkleblock message is the header followed by a partial merkle tree
          var merkleBlock = new MerkleBlock(
            Buffer.concat([header.toBuffer(), diff.cbTxMerkleTree.toBuffer()])
          );

          expect(header.hash).to.be.equal(diff.blockHash);
          expect(merkleBlock.validMerkleTree()).to.be.true;
          expect(merkleBlock.hasTransaction(diff.cbTx)).to.be.true;
          expect(diff.cbTx.extraPayload.height).to.be.equal(vector.height);
        });
      });
    });

    describe('testnetFull', function () {
      var vector = coreDiffs.testnetFull;
      var diff;
      var rpcDiff;

      before(function () {
        diff = SimplifiedMNListDiff.fromHexString(vector.hex, 'testnet');
        rpcDiff = SimplifiedMNListDiff.fromObject(coreDiffsJSON[0], 'testnet');
      });

      it('Should hold the same entries as Core RPC reports', function () {
        expect(diff.mnList.length).to.be.equal(coreDiffsJSON[0].mnList.length);
        diff.mnList.forEach(function (entry, i) {
          var rpcEntry = coreDiffsJSON[0].mnList[i];
          expect(entry.calculateHash()).to.be.deep.equal(rpcDiff.mnList[i].calculateHash());
          expect(entry.proRegTxHash).to.be.equal(rpcEntry.proRegTxHash);
          expect(entry.confirmedHash).to.be.equal(rpcEntry.confirmedHash);
          expect(entry.nVersion).to.be.equal(rpcEntry.nVersion);
          expect(entry.pubKeyOperator).to.be.equal(rpcEntry.pubKeyOperator);
          expect(entry.votingAddress).to.be.equal(rpcEntry.votingAddress);
          expect(entry.isValid).to.be.equal(rpcEntry.isValid);
          // Version 1 entries carry no type on the wire
          if (entry.nVersion >= 2) {
            expect(entry.nType).to.be.equal(rpcEntry.nType);
            expect(entry.platformNodeID).to.be.equal(rpcEntry.platformNodeID);
            expect(entry.platformHTTPPort).to.be.equal(rpcEntry.platformHTTPPort);
          }
          if (entry.nVersion >= 3) {
            expect(entry.addresses).to.be.deep.equal(rpcEntry.addresses);
            expect(entry.service).to.be.equal(rpcEntry.service);
          }
        });
        var v3Types = diff.mnList.filter(function (entry) {
          return entry.nVersion === 3;
        }).map(function (entry) {
          return entry.nType;
        });
        expect(v3Types).to.include.members([0, 1]);
      });
      it('Should hold the same quorums and chainlock signatures as Core RPC reports', function () {
        var quorums = diff.newQuorums.map(function (quorum) {
          return quorum.toObject();
        });
        expect(quorums).to.be.deep.equal(coreDiffsJSON[0].newQuorums);
        expect(diff.deletedQuorums).to.be.deep.equal(coreDiffsJSON[0].deletedQuorums);
        expect(diff.quorumsCLSigs).to.be.deep.equal(coreDiffsJSON[0].quorumsCLSigs);
        // signers that are not all set must be counted as Core's RPC does
        expect(diff.newQuorums.some(function (quorum) {
          return quorum.signersCount < quorum.getParams().size;
        })).to.be.true;
      });
      it('Should serialize Core RPC JSON to the bytes Core sends', function () {
        expect(rpcDiff.toBuffer().toString('hex')).to.be.equal(vector.hex);
      });
      it('Should match the merkle roots in the coinbase', function () {
        var mnList = new SimplifiedMNList(diff);
        expect(mnList.calculateMerkleRoot()).to.be.equal(diff.merkleRootMNList);
        expect(mnList.calculateMerkleRootQuorums()).to.be.equal(diff.merkleRootQuorums);
      });
      it('Should match the merkle roots after applying the incremental diff', function () {
        var incremental = SimplifiedMNListDiff.fromHexString(
          coreDiffs.testnetIncremental.hex,
          'testnet'
        );
        var mnList = new SimplifiedMNList(diff);

        mnList.applyDiff(incremental);

        expect(mnList.calculateMerkleRoot()).to.be.equal(incremental.merkleRootMNList);
        expect(mnList.calculateMerkleRootQuorums()).to.be.equal(incremental.merkleRootQuorums);
      });
    });
  });
  describe('copy', function () {
    it('Should create a detached copy of an instance', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      var copy = new SimplifiedMNListDiff(instance);

      copy.baseBlockHash =
        '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);
    });
  });
});
