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
    describe('with a crafted count', function () {
      // byte offsets of each single-byte count in mnListDiffHexString
      var offsets = {};

      before(function () {
        var diff = SimplifiedMNListDiff.fromHexString(mnListDiffHexString, 'testnet');
        var tree = diff.cbTxMerkleTree;
        var offset = 2 + 32 + 32 + 4; // nVersion, base and block hashes, totalTransactions
        offsets['Merkle hash'] = offset;
        offset += 1 + tree.merkleHashes.length * 32;
        offsets['Merkle flag byte'] = offset;
        offset += 1 + tree.merkleFlags.length + diff.cbTx.toBuffer().length;
        offsets['Deleted masternode'] = offset;
        offset += 1 + diff.deletedMNs.length * 32;
        offsets['Masternode list entry'] = offset;
        offset += 1;
        offsets['Deleted quorum'] = offset;
        offset += 1 + diff.deletedQuorums.length * 33;
        offsets['New quorum'] = offset;
        offset += 1;
        diff.newQuorums.forEach(function (quorum) {
          offset += quorum.toBufferForHashing().length;
        });
        offsets['Quorum chainlock signature'] = offset;
        offsets['Quorum index'] = offset + 1 + 96;

        // the vector has no masternode changes, so mnList adds no bytes above
        expect(diff.mnList).to.be.empty;
        Object.keys(offsets).forEach(function (name) {
          expect(parseInt(mnListDiffHexString.substr(offsets[name] * 2, 2), 16)).to.be.below(0xfd);
        });
      });

      [
        'Merkle hash',
        'Merkle flag byte',
        'Deleted masternode',
        'Masternode list entry',
        'Deleted quorum',
        'New quorum',
        'Quorum chainlock signature',
        'Quorum index',
      ].forEach(function (name) {
        function craftCount(count) {
          var position = offsets[name] * 2;
          return mnListDiffHexString.slice(0, position) + count
            + mnListDiffHexString.slice(position + 2);
        }

        it('Should throw quickly on a huge ' + name + ' count', function () {
          this.timeout(2000);
          // MAX_SIZE, the largest count Core reads
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craftCount('fe00000002'), 'testnet');
          }).to.throw(name + ' count 33554432 is larger than the remaining data allows');
        });
        it('Should reject a ' + name + ' count above MAX_SIZE or not shortest-encoded', function () {
          this.timeout(2000);
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craftCount('feffffffff'), 'testnet');
          }).to.throw('CompactSize too large');
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craftCount('fd0100'), 'testnet');
          }).to.throw('non-canonical CompactSize');
        });
      });
    });
    it('Should throw if the diff is cut off inside a fixed-size field', function () {
      // nVersion, baseBlockHash, then half of blockHash
      var hex = mnListDiffHexString.slice(0, (2 + 32 + 16) * 2);

      expect(function () {
        SimplifiedMNListDiff.fromHexString(hex, 'testnet');
      }).to.throw('expected 32 more bytes, found 16');
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
        ['fe00000002', '31'].forEach(function (size) {
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craft('01', size), 'testnet');
          }).to.throw('Expected a bit set of 50 bits, got');
        });
      });
      it('Should throw if it is longer than the data of an unknown quorum type', function () {
        this.timeout(2000);
        // MAX_SIZE bits
        expect(function () {
          SimplifiedMNListDiff.fromHexString(craft('c8', 'fe00000002'), 'testnet');
        }).to.throw('expected 4194304 more bytes');
      });
      it('Should round-trip a custom quorum type through fromJSON with its params', function () {
        var override = { 200: { size: 50, threshold: 30, maximumActiveQuorumsCount: 24 } };
        var hex = craft('c8', '32');
        var diff = SimplifiedMNListDiff.fromHexString(hex, 'testnet', override);
        var copy = SimplifiedMNListDiff.fromJSON(JSON.parse(JSON.stringify(diff)), override);

        expect(diff.newQuorums[0].llmqType).to.be.equal(200);
        expect(copy.toBuffer().toString('hex')).to.be.equal(hex);
      });
      it('Should reject a size above MAX_SIZE or not shortest-encoded', function () {
        this.timeout(2000);
        ['01', 'c8'].forEach(function (llmqType) {
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craft(llmqType, hugeSize), 'testnet');
          }).to.throw('CompactSize too large');
          expect(function () {
            SimplifiedMNListDiff.fromHexString(craft(llmqType, 'fd3200'), 'testnet');
          }).to.throw('non-canonical CompactSize');
        });
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
  describe('toBuffer quorumsCLSigs', function () {
    var signature = coreDiffsJSON[0].quorumsCLSigs[0];
    var signatureHex = Object.keys(signature)[0];

    [
      ['two signatures in one entry', Object.assign({}, signature, coreDiffsJSON[0].quorumsCLSigs[1]),
        'Expected each quorumsCLSigs entry to hold exactly one signature'],
      ['no signature', {}, 'Expected each quorumsCLSigs entry to hold exactly one signature'],
      ['an array entry', [[1]], 'Expected each quorumsCLSigs entry to hold exactly one signature'],
      ['a short signature', { abcd: [1] }, 'Expected quorumsCLSigs keys to be bls signatures'],
      ['indexes that are not an array', { [signatureHex]: 1 },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
      ['an index above 65535', { [signatureHex]: [1, 65536] },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
      ['a negative index', { [signatureHex]: [-1] },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
      ['a fractional index', { [signatureHex]: [1.5] },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
      ['a string index', { [signatureHex]: ['1'] },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
      ['unsorted indexes', { [signatureHex]: [2, 1] },
        'Expected quorumsCLSigs indexes to be sorted and unique, as Core sends them'],
      ['a repeated index', { [signatureHex]: [1, 1] },
        'Expected quorumsCLSigs indexes to be sorted and unique, as Core sends them'],
      // eslint-disable-next-line no-sparse-arrays
      ['a sparse index array', { [signatureHex]: [0, , 2] },
        'Expected quorumsCLSigs values to be arrays of quorum indexes'],
    ].forEach(function (testCase) {
      it('Should reject ' + testCase[0], function () {
        var diff = new SimplifiedMNListDiff(mnListDiffJSON);
        diff.quorumsCLSigs = [testCase[1]];

        expect(function () {
          diff.toBuffer();
        }).to.throw(testCase[2]);
      });
    });
  });
  it('Should reject a sparse quorumsCLSigs array', function () {
    var diff = new SimplifiedMNListDiff(mnListDiffJSON);
    var signatureHex = Object.keys(coreDiffsJSON[0].quorumsCLSigs[0])[0];
    // eslint-disable-next-line no-sparse-arrays
    diff.quorumsCLSigs = [, { [signatureHex]: [0] }];
    expect(function () {
      diff.toBuffer();
    }).to.throw('Expected each quorumsCLSigs entry to hold exactly one signature');
  });
  it('Should reject a chainlock signature that appears in two entries', function () {
    var diff = new SimplifiedMNListDiff(mnListDiffJSON);
    var signatureHex = Object.keys(coreDiffsJSON[0].quorumsCLSigs[0])[0];
    diff.quorumsCLSigs = [{ [signatureHex]: [0] }, { [signatureHex.toUpperCase()]: [1] }];
    expect(function () {
      diff.toBuffer();
    }).to.throw('Expected each quorumsCLSigs signature to appear once');
  });
  describe('fromBuffer canonical encodings', function () {
    // a diff with one chainlock signature: serialize, then edit the trailing bytes
    function withCLSigs(clSigs) {
      var diff = new SimplifiedMNListDiff(mnListDiffJSON);
      diff.quorumsCLSigs = [];
      var head = diff.toBuffer().slice(0, -1); // drop the zero quorumsCLSigs count
      return Buffer.concat([head, clSigs]);
    }
    var signature = Buffer.from(Object.keys(coreDiffsJSON[0].quorumsCLSigs[0])[0], 'hex');

    it('Should reject chainlock indexes that are not a sorted set', function () {
      [[2, 1], [1, 1]].forEach(function (pair) {
        var indexes = Buffer.alloc(4);
        indexes.writeUInt16LE(pair[0], 0);
        indexes.writeUInt16LE(pair[1], 2);
        var raw = withCLSigs(Buffer.concat([Buffer.from('01', 'hex'), signature, Buffer.from('02', 'hex'), indexes]));
        expect(function () {
          SimplifiedMNListDiff.fromBuffer(raw, Networks.testnet);
        }).to.throw('Quorum chainlock indexes are not a sorted set');
      });
    });

    it('Should reject a repeated chainlock signature', function () {
      var entry = Buffer.concat([signature, Buffer.from('00', 'hex')]);
      var raw = withCLSigs(Buffer.concat([Buffer.from('02', 'hex'), entry, entry]));
      expect(function () {
        SimplifiedMNListDiff.fromBuffer(raw, Networks.testnet);
      }).to.throw('Duplicate quorum chainlock signature');
    });

    it('Should reject a coinbase transaction with a non-canonical CompactSize', function () {
      var diff = new SimplifiedMNListDiff(mnListDiffJSON);
      diff.quorumsCLSigs = [];
      var raw = diff.toBuffer();
      var cbTx = diff.cbTx.toBuffer();
      var cbStart = raw.indexOf(cbTx);
      expect(cbStart).to.be.above(0);
      // the input count follows the 4-byte version and type; re-encode 1 as fd0100
      expect(cbTx[4]).to.equal(1);
      var nonCanonicalTx = Buffer.concat([cbTx.slice(0, 4), Buffer.from('fd0100', 'hex'), cbTx.slice(5)]);
      var tampered = Buffer.concat([raw.slice(0, cbStart), nonCanonicalTx, raw.slice(cbStart + cbTx.length)]);
      expect(function () {
        SimplifiedMNListDiff.fromBuffer(tampered, Networks.testnet);
      }).to.throw('Non-canonical coinbase transaction encoding');
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
      it('Should give each evonode the Platform endpoint Core RPC reports', function () {
        var checked = 0;
        diff.mnList.forEach(function (entry, i) {
          var platformHTTPS = coreDiffsJSON[0].mnList[i].addresses.platform_https;
          // Version 1 entries carry no type on the wire
          if (entry.nVersion < 2 || !platformHTTPS) {
            return;
          }
          var endpoint = entry.getPlatformHTTPSEndpoint();
          expect(endpoint.host + ':' + endpoint.port).to.be.equal(platformHTTPS[0]);
          checked += 1;
        });
        expect(checked).to.be.above(50);
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
    it('Should keep the ExtNetInfo bytes entries were read from', function () {
      var vector = coreDiffs.testnetFull;
      var diff = SimplifiedMNListDiff.fromHexString(vector.hex, 'testnet');
      var copy = diff.copy();
      var extAddrEntries = copy.mnList.filter(function (entry) {
        return entry.nVersion >= 3;
      });

      expect(extAddrEntries).to.not.be.empty;
      extAddrEntries.forEach(function (entry) {
        expect(entry._rawExtNetInfo).to.be.an('object');
      });
      expect(copy.toBuffer().toString('hex')).to.be.equal(vector.hex);
    });
    it('Should create a detached copy of an instance', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      var copy = new SimplifiedMNListDiff(instance);

      copy.baseBlockHash =
        '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);
    });
  });
});
