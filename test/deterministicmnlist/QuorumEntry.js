/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var QuorumEntry = require('../../lib/deterministicmnlist/QuorumEntry');
var expect = require('chai').expect;
var merkleUtils = require('../../lib//util/merkletree');

var quorumEntryJSON = {
  "version": 1,
  "llmqType": 2,
  "quorumHash": "0000000007697fd69a799bfa26576a177e817bc0e45b9fcfbf48b362b05aeff2",
  "signersCount": 400,
  "signers": "bf7fffaffedffef77fef7ffffffcbdffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f0000000000",
  "validMembersCount": 400,
  "validMembers": "bf7fffaffedffef77fef7ffffffcbfffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f0000000000",
  "quorumPublicKey": "03a3fbbe99d80a9be8fc59fd4fe43dfbeba9119b688e97493664716cdf15ae47fad70fea7cb93f20fba10d689f9e3c02",
  "quorumVvecHash": "bede6b120304eb31d173678bb54ffcb0ab91f8d72d5af78b5047f76e393a26a2",
  "quorumSig": "9944c544e03a478b401b65cabbb24338872613f7d58ff13ab038ab86418ec70ef1734ff43e965ccb83e02da83b10d44c0f23c630752cfb29b402149a1fc3fad0760e6341a4a1031efad2983c8637d2a461e9bcaf935b7a4dfa225ed2f7771c75",
  "membersSig": "92eda5c13583577719bea9337b4b9b6286ac11a072de0955b0dc5a012280bb557a53f9643cee7730dabe2d3a4a19042813ef5d39ae92d0015554954011c1e12bc688d4d7672ac33c4001e0dedbfe5d0316f2ad23206d478964ca62d75f50e4d0"
};

var quorumEntryHex = "010002f2ef5ab062b348bfcf9f5be4c07b817e176a5726fa9b799ad67f690700000000fd9001bf7fffaffedffef77fef7ffffffcbdffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f0000000000fd9001bf7fffaffedffef77fef7ffffffcbfffaffffffffffffdfffff7f7f7fff7ffefbfffffdff1fdbf7feffcffbb1f000000000003a3fbbe99d80a9be8fc59fd4fe43dfbeba9119b688e97493664716cdf15ae47fad70fea7cb93f20fba10d689f9e3c02a2263a396ef747508bf75a2dd7f891abb0fc4fb58b6773d131eb0403126bdebe9944c544e03a478b401b65cabbb24338872613f7d58ff13ab038ab86418ec70ef1734ff43e965ccb83e02da83b10d44c0f23c630752cfb29b402149a1fc3fad0760e6341a4a1031efad2983c8637d2a461e9bcaf935b7a4dfa225ed2f7771c7592eda5c13583577719bea9337b4b9b6286ac11a072de0955b0dc5a012280bb557a53f9643cee7730dabe2d3a4a19042813ef5d39ae92d0015554954011c1e12bc688d4d7672ac33c4001e0dedbfe5d0316f2ad23206d478964ca62d75f50e4d0";
var quorumEntryHash = "082f5e29385f81704ef63c886aa20c2f8d69efd87d3937d6769285e2ead9ea0f";
var commitmentHash = "381fbd47cd5ab01a48da6a20632b1cba9f4d3018d22c7131d99cd7b2a06295df";

describe('QuorumEntry', function () {
  describe('fromBuffer', function () {
    it('Should be able to parse data from a buffer when ip address is present', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var entryJSON = entry.toObject();
      expect(entryJSON).to.be.deep.equal(quorumEntryJSON)
    });
    it('Should be able to generate correct hash', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      expect(entry.calculateHash()).to.be.deep.equal(Buffer.from(quorumEntryHash, 'hex'));
    });
  });
  describe('to buffer', function () {
    it('Should be able to generate correct buffer', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var buffer = entry.toBuffer();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHex, 'hex'));
    });
  });
  describe('to buffer for hashing', function () {
    it('Should be able to generate correct buffer for hashing', function () {
      var entry = QuorumEntry.fromBuffer(Buffer.from(quorumEntryHex, 'hex'));
      var buffer = entry.toBufferForHashing();
      expect(buffer).to.be.deep.equal(Buffer.from(quorumEntryHex, 'hex'));
    });
  });
  describe('generate commitmentHash', function () {
    it('Should be able to generate a correct commitmentHash', function () {
      var entry = new QuorumEntry(quorumEntryJSON);
      var entryCommitmentHash = entry.getCommitmentHash();
      expect(entryCommitmentHash).to.be.deep.equal(Buffer.from(commitmentHash, 'hex'));
    });
  });
});
