/* eslint-disable */

var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var merkleUtils = require('../util/merkletree');
var SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
var constants = require('../constants');
var Networks = require('../networks');
var Transaction = require('../transaction');

var getMerkleTree = merkleUtils.getMerkleTree;
var getMerkleRoot = merkleUtils.getMerkleRoot;

function SimplifiedMNList(simplifiedMNListDiff) {
  this.baseBlockHash = constants.NULL_HASH;
  this.blockHash = constants.NULL_HASH;
  /**
   * Note that this property contains ALL masternodes, including banned ones.
   * Use getValidMasternodesList() method to get the list of only valid nodes.
   * This in needed for merkleRootNMList calculation
   * @type {SimplifiedMNListEntry[]}
   */
  this.mnList = [];
  /**
   * This property contains all active quorums
   * ordered by llmqType and creation time ascending.
   * @type {QuorumEntry[]}
   */
  this.quorumList = [];
  /**
   * This property contains only valid, not PoSe-banned nodes.
   * @type {SimplifiedMNListEntry[]}
   */
  this.validMNs = [];
  this.merkleRootMNList = constants.NULL_HASH;
  this.lastDiffMerkleRootMNList = constants.NULL_HASH;
  this.lastDiffMerkleRootQuorums = constants.NULL_HASH;
  this.quorumsActive = false;
  this.cbTx = null;
  this.cbTxMerkleTree = null;
  if (simplifiedMNListDiff) {
    this.applyDiff(simplifiedMNListDiff);
  }
}

/**
 *
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
 * @return {void|Boolean}
 */
SimplifiedMNList.prototype.applyDiff = function applyDiff(simplifiedMNListDiff) {
  // This will copy instance of SimplifiedMNListDiff or create a new instance if serialized data is passed
  var diff = new SimplifiedMNListDiff(simplifiedMNListDiff, this.network);
  this.network = diff.network;

  if (this.baseBlockHash === constants.NULL_HASH) {
    /* If the base block hash is a null hash, then this is the first time we apply any diff.
    * If we apply diff to the list for the first time, than diff's base block hash would be the base block hash
    * for the whole list.
    * */
    this.baseBlockHash = diff.baseBlockHash;
  }

  this.blockHash = diff.blockHash;

  this.deleteMNs(diff.deletedMNs);
  this.addOrUpdateMNs(diff.mnList);

  this.lastDiffMerkleRootMNList = diff.merkleRootMNList || constants.NULL_HASH;

  this.merkleRootMNList = this.calculateMerkleRoot();

  if (this.lastDiffMerkleRootMNList !== this.merkleRootMNList) {
    throw new Error("Merkle root from the diff doesn't match calculated merkle root after diff is applied");
  }

  this.cbTx = new Transaction(diff.cbTx);
  this.cbTxMerkleTree = diff.cbTxMerkleTree.copy();
  this.validMNs = this.mnList.filter(function (smlEntry) {
    return smlEntry.isValid;
  });
  this.quorumsActive = this.cbTx.version >= 2;

  if (this.quorumsActive) {
    this.deleteQuorums(diff.deletedQuorums);
    this.addAndMaybeRemoveQuorums(diff.newQuorums);
    this.lastDiffMerkleRootQuorums = diff.merkleRootQuorums || constants.NULL_HASH;

    if (this.quorumList.length > 0) {
      // we cannot verify the quorum merkle root for DashCore vers. < 0.16
      if (this.quorumList[0].isOutdatedRPC) {
        this.merkleRootQuorums = diff.merkleRootQuorums;
        return
      }
      this.merkleRootQuorums = this.calculateMerkleRootQuorums();
      if (this.lastDiffMerkleRootQuorums !== this.merkleRootQuorums) {
        throw new Error("merkleRootQuorums from the diff doesn't match calculated quorum root after diff is applied");
      }
    }
  }
};

/**
 * @private
 * Adds MNs to the MN list
 * @param {SimplifiedMNListEntry[]} mnListEntries
 */
SimplifiedMNList.prototype.addOrUpdateMNs = function addMNs(mnListEntries) {
  var newMNListEntries = mnListEntries.map(function (mnListEntry) {
    return mnListEntry.copy();
  });
  newMNListEntries.forEach(function (newMNListEntry) {
    var indexOfOldEntry = this.mnList.findIndex(function (oldMNListEntry) {
      return oldMNListEntry.proRegTxHash === newMNListEntry.proRegTxHash;
    });
    if (indexOfOldEntry > -1) {
      this.mnList[indexOfOldEntry] = newMNListEntry;
    } else {
      return this.mnList.push(newMNListEntry);
    }
  }, this);
};

/**
 * @private
 * Adds quorums to the quorum list
 * and maybe removes the oldest ones
 * if list has reached maximum entries for llmqType
 * @param {QuorumEntry[]} quorumEntries
 */
SimplifiedMNList.prototype.addAndMaybeRemoveQuorums = function addAndMaybeRemoveQuorums(quorumEntries) {

  var llmqTypeArray = [...this.getLLMQTypes()];

  var newQuorumsByType = llmqTypeArray.map((type) => {
    var hits = quorumEntries.filter(quorum => quorum.llmqType === type);
    return { llmqType: type, quorums: hits }
  });

  var quorumListByType = llmqTypeArray.map((type) => {
    var hits = this.quorumList.filter(quorum => quorum.llmqType === type);
    return { llmqType: type, quorums: hits };
  });
  i = 0;
  newQuorumsByType.forEach(function (quorumsByType) {
    quorumsByType.quorums.forEach(function (quorum) {
      if (quorumListByType[i].quorums.length === quorum.getParams().activeCount) {
        quorumListByType[i].quorums.shift();
      }
      quorumListByType[i].quorums.push(quorum);
    });
    i += 1;
  });
  if (quorumListByType[0].quorums.length > 0) {
    this.quorumList = [];
    quorumListByType.forEach((quorumsByType) => {
      if (quorumsByType.quorums.length > 0) {
        this.quorumList = this.quorumList.concat(quorumsByType.quorums)
      }
    });
  }
};

/**
 * @private
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
SimplifiedMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function (proRegTxHash) {
    var mnIndex = this.mnList.findIndex(function (MN) {
      return MN.proRegTxHash === proRegTxHash;
    });
    if (mnIndex > -1) {
      this.mnList.splice(mnIndex, 1);
    }
  }, this);
};

/**
 * @private
 * Deletes quorums from the quorum list
 * @param {Array<obj>} deletedQuorums - deleted quorum objects
 */
SimplifiedMNList.prototype.deleteQuorums = function deleteQuorums(deletedQuorums) {
  deletedQuorums.forEach(function (deletedQuorum) {
    var quorumIndex = this.quorumList.findIndex(function (quorum) {
      return (quorum.llmqType === deletedQuorum.llmqType && quorum.quorumHash === deletedQuorum.quorumHash);
    });
    if (quorumIndex > -1) {
      this.quorumList.splice(quorumIndex, 1);
    }
  }, this);
};

/**
 * Compares merkle root from the most recent diff applied matches the merkle root of the list
 * @returns {boolean}
 */
SimplifiedMNList.prototype.verify = function verify() {
  return this.calculateMerkleRoot() === this.lastDiffMerkleRootMNList;
};

/**
 * @private
 * Sorts MN List in deterministic order
 */
SimplifiedMNList.prototype.sort = function sort() {
  this.mnList.sort(function (a, b) {
    return Buffer.compare(Buffer.from(a.proRegTxHash, 'hex').reverse(), Buffer.from(b.proRegTxHash, 'hex').reverse());
  });
};

/**
 * @private
 * @param {QuorumEntry[]} quorumList - sort array of quorum entries
 * Sorts the quorums deterministically
 */
SimplifiedMNList.prototype.sortQuorums = function sortQuorumsEntries(quorumList) {
  quorumList.sort(function (a, b) {
    return Buffer.compare(Buffer.from(a.calculateHash()).reverse(),  Buffer.from(b.calculateHash()).reverse());
  });
  return quorumList;
};

/**
 * Calculates merkle root of the MN list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRoot = function calculateMerkleRoot() {
  if (this.mnList.length < 1) {
    return constants.NULL_HASH;
  }
  this.sort();
  var sortedEntryHashes = this.mnList.map(
    function (mnListEntry) {
      return mnListEntry.calculateHash();
    }
  );
  return getMerkleRoot(getMerkleTree(sortedEntryHashes)).reverse().toString('hex');
};

/**
 * Calculates merkle root of the quorum list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRootQuorums = function calculateMerkleRootQuorums() {
  if (this.quorumList.length < 1) {
    return constants.NULL_HASH;
  }
  var sortedQuorums = this.sortQuorums(this.quorumList.slice());
  var sortedHashes = sortedQuorums.map((quorum) => quorum.calculateHash().reverse());
  return getMerkleRoot(getMerkleTree(sortedHashes)).reverse().toString('hex');
};

/**
 * Returns a list of valid masternodes
 * @returns {SimplifiedMNListEntry[]}
 */
SimplifiedMNList.prototype.getValidMasternodesList = function getValidMasternodes() {
  return this.validMNs;
};

/**
 * Returns a single quorum
 * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
 * @param {string} quorumHash - quorumHash of quorum
 * @returns {QuorumEntry}
 */
SimplifiedMNList.prototype.getQuorum = function getQuorum(llmqType, quorumHash) {
  return this.quorumList.find(function (quorum) {
    return (quorum.llmqType === llmqType && quorum.quorumHash === quorumHash)
  })
};

/**
 * Returns all quorums - verified or unverified
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getQuorums = function getQuorums() {
  return this.quorumList;
};

/**
 * Returns all already verified quorums
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getVerifiedQuorums = function getVerifiedQuorums() {
  return this.quorumList.filter(function (quorum) {
    return quorum.isVerified;
  })
};

/**
 * Returns all still unverified quorums
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getUnverifiedQuorums = function getUnverifiedQuorums() {
  return this.quorumList.filter(function (quorum) {
    return !quorum.isVerified;
  })
};

/**
 * @return {number}
 */
SimplifiedMNList.prototype.getLLMQTypes = function getLLMQTypes() {
  var llmqTypes = [];

  if (!this.network) {
    throw new Error('Network is not set');
  }

  switch (this.network.name) {
    case Networks.livenet.name:
      llmqTypes = [constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_85];
      return llmqTypes;
    case Networks.testnet.name:
      if (this.mnList.length > 100) {
        llmqTypes = [constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
          constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
          constants.LLMQ_TYPES.LLMQ_TYPE_400_85];
        return llmqTypes;
      }
      // regtest
      if (Networks.testnet.regtestEnabled === true) {
        llmqTypes = [constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST,
          constants.LLMQ_TYPES.LLMQ_TYPE_50_60];
        return llmqTypes;
      }
      // devnet
      llmqTypes = [constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_DEVNET,
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_85];
      return llmqTypes;
    default:
      throw new Error('Unknown network');
  }
};

/**
 * Converts simplified MN list to simplified MN list diff that can be used to serialize data
 * to json, buffer, or a hex string
 * @param {string} [network]
 */
SimplifiedMNList.prototype.toSimplifiedMNListDiff = function toSimplifiedMNListDiff(network) {
  if (!this.cbTx || !this.cbTxMerkleTree) {
    throw new Error("Can't convert MN list to diff - cbTx is missing");
  }
  return SimplifiedMNListDiff.fromObject({
    baseBlockHash: this.baseBlockHash,
    blockHash: this.blockHash,
    cbTx: new Transaction(this.cbTx),
    cbTxMerkleTree: this.cbTxMerkleTree,
    // Always empty, as simplified MN list doesn't have a deleted mn list
    deletedMNs: [],
    mnList: this.mnList,
    deletedQuorums: [],
    newQuorums: this.quorumList,
    merkleRootMNList: this.merkleRootMNList,
    merkleRootQuorums: this.merkleRootQuorums
  }, network);
};

/**
 * Deterministically selects all members of the quorum which
 * has started it's DKG session with the block of this MNList
 * @param {Buffer} selectionModifier
 * @param {number} size
 * @return {SimplifiedMNListEntry[]}
 */
SimplifiedMNList.prototype.calculateQuorum = function calculateQuorum(selectionModifier, size) {

  var scores = this.calculateScores(selectionModifier);

  scores.sort(function (a, b) {
    return Buffer.compare(a.score, b.score);
  });

  scores.reverse();

  return scores.map(function (score) {
    return score.mn;
  }).slice(0, size);
};

/**
 * Calculates scores for MN selection
 * it calculates sha256(sha256(proTxHash, confirmedHash), modifier) per MN
 * Please note that this is not a double-sha256 but a single-sha256
 * @param {Buffer} modifier
 * @return {Object[]} scores
 */
SimplifiedMNList.prototype.calculateScores = function calculateScores(modifier) {
  return this.validMNs.filter(function (mn) {
    return mn.confirmedHash !== constants.NULL_HASH;
  }).map(function (mn) {
    var bufferWriter = new BufferWriter();
    bufferWriter.writeReverse(mn.confirmedHashWithProRegTxHash());
    bufferWriter.writeReverse(modifier);
    return { score: Hash.sha256(bufferWriter.toBuffer()).reverse(), mn: mn };
  });
};

module.exports = SimplifiedMNList;
