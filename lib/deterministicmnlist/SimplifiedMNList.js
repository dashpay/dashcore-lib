const groupBy = require('lodash/groupBy');
const BufferWriter = require('../encoding/bufferwriter');
const Hash = require('../crypto/hash');
const { getMerkleTree, getMerkleRoot } = require('../util/merkletree');
const SimplifiedMNListDiff = require('./SimplifiedMNListDiff');
const QuorumEntry = require('./QuorumEntry');
const SimplifiedMNListEntry = require('./SimplifiedMNListEntry');
const PartialMerkleTree = require('../block/PartialMerkleTree');
const constants = require('../constants');
const Networks = require('../networks');
const Transaction = require('../transaction');

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
 * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - serialized or parsed
 * @return {void|Boolean}
 */
SimplifiedMNList.prototype.applyDiff = function applyDiff(
  simplifiedMNListDiff
) {
  // This will copy an instance of SimplifiedMNListDiff or create a new instance
  const diff = new SimplifiedMNListDiff(simplifiedMNListDiff, this.network);

  // only when we apply the first diff we set the network
  if (!this.network) {
    this.network = diff.network;
  }

  if (this.baseBlockHash === constants.NULL_HASH) {
    /* If the base block hash is a null hash, then this is the first time we apply any diff.
     * If we apply diff to the list for the first time, then diff's base block hash would be
     * the base block hash for the whole list.
     * */
    this.baseBlockHash = diff.baseBlockHash;
  }

  this.blockHash = diff.blockHash;

  if (this.lastBlockHash && this.lastBlockHash !== diff.baseBlockHash) {
    throw new Error(
      "Cannot apply diff: previous blockHash needs to equal the new diff's baseBlockHash"
    );
  }

  this.deleteMNs(diff.deletedMNs);
  this.addOrUpdateMNs(diff.mnList);

  this.lastDiffMerkleRootMNList = diff.merkleRootMNList || constants.NULL_HASH;

  this.merkleRootMNList = this.calculateMerkleRoot();

  if (this.lastDiffMerkleRootMNList !== this.merkleRootMNList) {
    throw new Error(
      "Merkle root from the diff doesn't match calculated merkle root after diff is applied"
    );
  }

  this.cbTx = new Transaction(diff.cbTx);
  this.cbTxMerkleTree = diff.cbTxMerkleTree.copy();
  this.validMNs = this.mnList.filter((smlEntry) => smlEntry.isValid);
  this.quorumsActive = this.cbTx.version >= 2;

  if (this.quorumsActive) {
    this.deleteQuorums(diff.deletedQuorums);
    this.addAndMaybeRemoveQuorums(diff.newQuorums);
    this.lastDiffMerkleRootQuorums =
      diff.merkleRootQuorums || constants.NULL_HASH;

    if (this.quorumList.length > 0) {
      // we cannot verify the quorum merkle root for DashCore vers. < 0.16
      if (this.quorumList[0].isOutdatedRPC) {
        this.merkleRootQuorums = diff.merkleRootQuorums;
        return;
      }
      this.quorumList = this.sortQuorums(this.quorumList);
      this.merkleRootQuorums = this.calculateMerkleRootQuorums();
      if (this.lastDiffMerkleRootQuorums !== this.merkleRootQuorums) {
        throw new Error(
          "merkleRootQuorums from the diff doesn't match calculated quorum root after diff is applied"
        );
      }
    }
  }
  this.lastBlockHash = this.blockHash;
};

/**
 * @private
 * Adds MNs to the MN list
 * @param {SimplifiedMNListEntry[]} mnListEntries
 */
SimplifiedMNList.prototype.addOrUpdateMNs = function addMNs(mnListEntries) {
  const newMNListEntries = mnListEntries.map((mnListEntry) =>
    mnListEntry.copy()
  );
  // eslint-disable-next-line consistent-return
  newMNListEntries.forEach(function (newMNListEntry) {
    const indexOfOldEntry = this.mnList.findIndex(
      (oldMNListEntry) =>
        oldMNListEntry.proRegTxHash === newMNListEntry.proRegTxHash
    );
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
SimplifiedMNList.prototype.addAndMaybeRemoveQuorums =
  function addAndMaybeRemoveQuorums(quorumEntries) {
    const newGroupedQuorums = groupBy(quorumEntries, 'llmqType');
    const existingQuorums = groupBy(this.quorumList, 'llmqType');
    const newQuorumsTypes = Object.keys(newGroupedQuorums);

    newQuorumsTypes.forEach((quorumType) => {
      const numberOfQuorumsInTheList = existingQuorums[quorumType]
        ? existingQuorums[quorumType].length
        : 0;
      const numberOfQuorumsToAdd = newGroupedQuorums[quorumType]
        ? newGroupedQuorums[quorumType].length
        : 0;
      const maxAllowedQuorumsOfType = QuorumEntry.getParams(
        Number(quorumType)
      ).maximumActiveQuorumsCount;

      if (
        numberOfQuorumsInTheList + numberOfQuorumsToAdd >
        maxAllowedQuorumsOfType
      ) {
        throw new Error(
          `Trying to add more quorums to quorum type ${quorumType} than its maximumActiveQuorumsCount of ${maxAllowedQuorumsOfType} permits`
        );
      }

      this.quorumList = this.quorumList.concat(newGroupedQuorums[quorumType]);
    });
  };

/**
 * @private
 * Deletes MNs from the MN list
 * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
 */
SimplifiedMNList.prototype.deleteMNs = function deleteMN(proRegTxHashes) {
  proRegTxHashes.forEach(function (proRegTxHash) {
    const mnIndex = this.mnList.findIndex(
      (MN) => MN.proRegTxHash === proRegTxHash
    );
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
SimplifiedMNList.prototype.deleteQuorums = function deleteQuorums(
  deletedQuorums
) {
  deletedQuorums.forEach(function (deletedQuorum) {
    const quorumIndex = this.quorumList.findIndex(
      (quorum) =>
        quorum.llmqType === deletedQuorum.llmqType &&
        quorum.quorumHash === deletedQuorum.quorumHash
    );
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
  this.mnList.sort((a, b) =>
    Buffer.compare(
      Buffer.from(a.proRegTxHash, 'hex').reverse(),
      Buffer.from(b.proRegTxHash, 'hex').reverse()
    )
  );
};

/**
 * @private
 * @param {QuorumEntry[]} quorumList - sort array of quorum entries
 * Sorts the quorums deterministically
 */
SimplifiedMNList.prototype.sortQuorums = function sortQuorumsEntries(
  quorumList
) {
  quorumList.sort((a, b) => {
    const hashA = Buffer.from(a.calculateHash()).reverse();
    const hashB = Buffer.from(b.calculateHash()).reverse();
    return Buffer.compare(hashA, hashB);
  });
  return quorumList;
};

/**
 * Calculates merkle root of the MN list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRoot =
  function calculateMerkleRoot() {
    if (this.mnList.length < 1) {
      return constants.NULL_HASH;
    }
    this.sort();
    const sortedEntryHashes = this.mnList.map((mnListEntry) =>
      mnListEntry.calculateHash()
    );
    return getMerkleRoot(getMerkleTree(sortedEntryHashes))
      .reverse()
      .toString('hex');
  };

/**
 * Calculates merkle root of the quorum list
 * @returns {string}
 */
SimplifiedMNList.prototype.calculateMerkleRootQuorums =
  function calculateMerkleRootQuorums() {
    if (this.quorumList.length < 1) {
      return constants.NULL_HASH;
    }
    const sortedHashes = this.quorumList.map((quorum) =>
      quorum.calculateHash().reverse()
    );
    return getMerkleRoot(getMerkleTree(sortedHashes)).reverse().toString('hex');
  };

/**
 * Returns a list of valid masternodes
 * @returns {SimplifiedMNListEntry[]}
 */
SimplifiedMNList.prototype.getValidMasternodesList =
  function getValidMasternodes() {
    return this.validMNs;
  };

/**
 * Returns a single quorum
 * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
 * @param {string} quorumHash - quorumHash of quorum
 * @returns {QuorumEntry}
 */
SimplifiedMNList.prototype.getQuorum = function getQuorum(
  llmqType,
  quorumHash
) {
  return this.quorumList.find(
    (quorum) => quorum.llmqType === llmqType && quorum.quorumHash === quorumHash
  );
};

/**
 * Returns all quorums - verified or unverified
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getQuorums = function getQuorums() {
  return this.quorumList;
};

/**
 * Returns only quorums of type llmqType - verified or unverified
 * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getQuorumsOfType = function getQuorumsOfType(
  llmqType
) {
  return this.quorumList.filter((quorum) => quorum.llmqType === llmqType);
};

/**
 * Returns all already verified quorums
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getVerifiedQuorums = function getVerifiedQuorums() {
  return this.quorumList.filter((quorum) => quorum.isVerified);
};

/**
 * Returns only already verified quorums of type llmqType
 * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getVerifiedQuorumsOfType =
  function getVerifiedQuorumsOfType(llmqType) {
    return this.quorumList.filter(
      (quorum) => quorum.isVerified && quorum.llmqType === llmqType
    );
  };

/**
 * Returns all still unverified quorums
 * @returns {QuorumEntry[]}
 */
SimplifiedMNList.prototype.getUnverifiedQuorums =
  function getUnverifiedQuorums() {
    return this.quorumList.filter((quorum) => !quorum.isVerified);
  };

/**
 * @return {constants.LLMQ_TYPES[]}
 */
SimplifiedMNList.prototype.getLLMQTypes = function getLLMQTypes() {
  let llmqTypes = [];

  if (!this.network) {
    throw new Error('Network is not set');
  }

  switch (this.network.name) {
    case Networks.livenet.name:
      llmqTypes = [
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_60_75,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_85,
        constants.LLMQ_TYPES.LLMQ_TYPE_100_67,
      ];
      return llmqTypes;
    case Networks.testnet.name:
      if (this.mnList.length > 100) {
        llmqTypes = [
          constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
          constants.LLMQ_TYPES.LLMQ_TYPE_60_75,
          constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
          constants.LLMQ_TYPES.LLMQ_TYPE_400_85,
          constants.LLMQ_TYPES.LLMQ_TYPE_TEST_V17,
        ];
        return llmqTypes;
      }
      // regtest
      if (Networks.testnet.regtestEnabled === true) {
        llmqTypes = [
          constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST,
          constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
          constants.LLMQ_TYPES.LLMQ_TYPE_60_75,
          constants.LLMQ_TYPES.LLMQ_TYPE_TEST_V17,
          constants.LLMQ_TYPES.LLMQ_TYPE_TEST_INSTANTSEND,
          constants.LLMQ_TYPES.LLMQ_TYPE_TEST_DIP0024,
          constants.LLMQ_TYPES.LLMQ_TEST_PLATFORM,
        ];
        return llmqTypes;
      }
      // devnet
      llmqTypes = [
        constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_DEVNET,
        constants.LLMQ_TYPES.LLMQ_TYPE_50_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_60_75,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_60,
        constants.LLMQ_TYPES.LLMQ_TYPE_400_85,
        constants.LLMQ_TYPES.LLMQ_TYPE_TEST_V17,
        constants.LLMQ_TYPES.LLMQ_TYPE_TEST_INSTANTSEND,
        constants.LLMQ_TYPES.LLMQ_TYPE_TEST_DIP0024,
        constants.LLMQ_TYPES.LLMQ_DEVNET_DIP0024,
        constants.LLMQ_TYPES.LLMQ_DEVNET_PLATFORM,
      ];
      return llmqTypes;
    default:
      throw new Error('Unknown network');
  }
};

/**
 * @return {constants.LLMQ_TYPES}
 */
SimplifiedMNList.prototype.getChainlockLLMQType =
  function getChainlockLLMQType() {
    if (!this.network) {
      throw new Error('Network is not set');
    }

    switch (this.network.name) {
      case Networks.livenet.name:
        return constants.LLMQ_TYPES.LLMQ_TYPE_400_60;
      case Networks.testnet.name:
        if (this.mnList.length > 100) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_50_60;
        }
        // regtest
        if (Networks.testnet.regtestEnabled === true) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST;
        }
        // devnet
        return constants.LLMQ_TYPES.LLMQ_TYPE_50_60;
      default:
        throw new Error('Unknown network');
    }
  };

/**
 * @return {constants.LLMQ_TYPES}
 */
SimplifiedMNList.prototype.getValidatorLLMQType =
  function getValidatorLLMQType() {
    if (!this.network) {
      throw new Error('Network is not set');
    }

    switch (this.network.name) {
      case Networks.livenet.name:
        return constants.LLMQ_TYPES.LLMQ_TYPE_100_67;
      case Networks.testnet.name:
        if (this.mnList.length > 100) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_100_67;
        }
        // regtest
        if (Networks.testnet.regtestEnabled === true) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST;
        }
        // devnet
        return constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_DEVNET;
      default:
        throw new Error('Unknown network');
    }
  };

/**
 * @return {constants.LLMQ_TYPES}
 */
SimplifiedMNList.prototype.getInstantSendLLMQType =
  function getInstantSendLLMQType() {
    if (!this.network) {
      throw new Error('Network is not set');
    }

    switch (this.network.name) {
      case Networks.livenet.name:
        return constants.LLMQ_TYPES.LLMQ_TYPE_50_60;
      case Networks.testnet.name:
        if (this.mnList.length > 100) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_50_60;
        }
        // regtest
        if (Networks.testnet.regtestEnabled === true) {
          return constants.LLMQ_TYPES.LLMQ_TYPE_LLMQ_TEST;
        }
        // devnet
        return constants.LLMQ_TYPES.LLMQ_TYPE_50_60;
      default:
        throw new Error('Unknown network');
    }
  };

/**
 * Converts simplified MN list to simplified MN list diff that can be used to serialize data
 * to json, buffer, or a hex string
 * @param {string} [network]
 */
SimplifiedMNList.prototype.toSimplifiedMNListDiff =
  function toSimplifiedMNListDiff(network) {
    if (!this.cbTx || !this.cbTxMerkleTree) {
      throw new Error("Can't convert MN list to diff - cbTx is missing");
    }
    return SimplifiedMNListDiff.fromObject(
      {
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
        merkleRootQuorums: this.merkleRootQuorums,
      },
      network
    );
  };

/**
 * Recreates SML from json
 * @param {Object} smlJson
 */
SimplifiedMNList.fromJSON = function fromJSON(smlJson) {
  const sml = new SimplifiedMNList();
  sml.baseBlockHash = smlJson.baseBlockHash;
  sml.blockHash = smlJson.blockHash;
  sml.merkleRootMNList = smlJson.merkleRootMNList;
  sml.lastDiffMerkleRootMNList = smlJson.lastDiffMerkleRootMNList;
  sml.lastDiffMerkleRootQuorums = smlJson.lastDiffMerkleRootQuorums;
  sml.quorumsActive = smlJson.quorumsActive;
  sml.cbTx = new Transaction(smlJson.cbTx);
  sml.cbTxMerkleTree = new PartialMerkleTree();
  sml.cbTxMerkleTree.totalTransactions =
    smlJson.cbTxMerkleTree.totalTransactions;
  sml.cbTxMerkleTree.merkleHashes = smlJson.cbTxMerkleTree.merkleHashes;
  sml.cbTxMerkleTree.merkleFlags = smlJson.cbTxMerkleTree.merkleFlags;
  sml.mnList = smlJson.mnList.map(
    (mnRecord) => new SimplifiedMNListEntry(mnRecord)
  );
  sml.quorumList = smlJson.quorumList.map(
    (quorumEntry) => new QuorumEntry(quorumEntry)
  );
  sml.validMNs = smlJson.validMNs.map(
    (mnRecord) => new SimplifiedMNListEntry(mnRecord)
  );

  return sml;
};

/**
 * Deterministically selects all members of the quorum which
 * has started it's DKG session with the block of this MNList
 * @param {Buffer} selectionModifier
 * @param {number} size
 * @return {SimplifiedMNListEntry[]}
 */
SimplifiedMNList.prototype.calculateQuorum = function calculateQuorum(
  selectionModifier,
  size
) {
  const scores = this.calculateScores(selectionModifier);

  scores.sort((a, b) => Buffer.compare(a.score, b.score));

  scores.reverse();

  return scores.map((score) => score.mn).slice(0, size);
};

/**
 * Calculates scores for MN selection
 * it calculates sha256(sha256(proTxHash, confirmedHash), modifier) per MN
 * Please note that this is not a double-sha256 but a single-sha256
 * @param {Buffer} modifier
 * @return {Object[]} scores
 */
SimplifiedMNList.prototype.calculateScores = function calculateScores(
  modifier
) {
  return this.validMNs
    .filter((mn) => mn.confirmedHash !== constants.NULL_HASH)
    .map((mn) => {
      const bufferWriter = new BufferWriter();
      bufferWriter.writeReverse(mn.confirmedHashWithProRegTxHash());
      bufferWriter.writeReverse(modifier);
      return { score: Hash.sha256(bufferWriter.toBuffer()).reverse(), mn };
    });
};

/**
 * Calculates scores for quorum signing selection
 * it calculates sha256(sha256(proTxHash, confirmedHash), modifier) per MN
 * Please note that this is not a double-sha256 but a single-sha256
 * @param {constants.LLMQ_TYPES} llmqType
 * @param {Buffer} modifier
 * @return {Object[]} scores
 */
SimplifiedMNList.prototype.calculateSignatoryQuorumScores =
  function calculateSignatoryQuorumScores(llmqType, modifier) {
    // for now we don't care if quorums have been verified or not
    return this.getQuorumsOfType(llmqType).map((quorum, index) => {
      const bufferWriter = new BufferWriter();
      bufferWriter.writeUInt8(llmqType);
      bufferWriter.writeReverse(Buffer.from(quorum.quorumHash, 'hex'));
      bufferWriter.writeReverse(modifier);
      return {
        score: Hash.sha256sha256(bufferWriter.toBuffer()),
        index,
        quorum,
      };
    });
  };

// const diffRaw = {
//   "baseBlockHash": "6e798cd039b085e571a21712da0b9393f68c850758960cb45f8952c5de9876da",
//   "blockHash": "2207353d13029921bf3281f465df85c76da4b91ea2264e600f0f05c8809780a4",
//   "cbTxMerkleTree": "0400000003441b2ef193436d7283c7d0758d0eab6fabaeeb3212b461d57ef4f78ca1ad1e3eb1880b4d99e655035e1fe8e596ec309de00cf812ffbfa8451cf73efe461ce38262d4e7d184f3d3c0f2c80ad1b2d55a1d4b234cdd29d9c15920f8b7c95e53f5ec0107",
//   "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027b050101ffffffff03e40256b0020000001976a9148708dff2bf8b31363cb4201d179b4714aa7b54a088acc1072780020000001976a9149d2b91cb9be0aedd91eeb437e2ea53400e5f4a2b88ac14fb2e30000000001976a914f0828f43d7f47604fe6b25872f050058f947719188ac000000004602007b050000231fdaf1246a3266bf15b31c89d8365662a855fa5abf4051f56b919508b17a140305a02016bfb6ae22a1564ba4485002bdbe37385bf2a218a2519867c517b1d7",
//   "deletedMNs": [
//   ],
//   "mnList": [
//     {
//       "proRegTxHash": "d15a39eaf6e483f331842c10fca4de8fa620a8a4608a0aa908ac3592bbb50be0",
//       "confirmedHash": "320ffb3d84b8309ae17351542aa18ea405db59cfd0cbab58330e056ccdf80ad6",
//       "service": "127.0.0.1:15957",
//       "pubKeyOperator": "8f973a82906958a19794804e901d9e236aaa03c85f2c0eba81295e91df072d209b76fd61e44d1a788c9c4fe1ddefeb51",
//       "votingAddress": "yRz19AZpXzLp8L1rDscmzRNPrwMG7YWP6E",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 1,
//       "platformHTTPPort": 35202,
//       "platformNodeID": "f45e58c3f4a0343452f03be313fc1736cbecab4b",
//       "_hash": "abafdfea33ebaa9e46f81aa581ca20e220ee68ea682a1ac1613ea930e2155869"
//     },
//     {
//       "proRegTxHash": "d59aba32d3a20e5e4d6e9efcbee6acb3cc29ca95aea375eee7e79e9915a67da1",
//       "confirmedHash": "3b91c9e3676d3504e121896d81ab7f57789b64d8414fb3de4fddcea293bf6053",
//       "service": "127.0.0.1:15954",
//       "pubKeyOperator": "a6b51ebff6f3e4786e5c744d03cb66b205658f0e9cb11dae9bf34b1aeef0a681c537c324050b2bcc7704070f80a76897",
//       "votingAddress": "ygw3zf7k6NVkFh7curzKLSKTbqULskMMRR",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 0,
//       "_hash": "5b931e822c12a487e1a31baf8b110b27dad8c1a86eb23edd65b4f0ded533e28e"
//     },
//     {
//       "proRegTxHash": "5b59362c7666a5b94de23a65abc52610baa2b788291012c28b8062bb7468b066",
//       "confirmedHash": "05aafa6fed806732bd94b0cbf360a990803aea7f190363d46a4164beaac4167d",
//       "service": "127.0.0.1:15955",
//       "pubKeyOperator": "a399b0f2ee603e924561a70a53a8433d02715d15bada0129b6bb8e4d8a609b5b01df040915768e66a90be5c1598497b9",
//       "votingAddress": "yVPftWYrP7uMG1Ywa4mXnuQLaoGcpYHppu",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 0,
//       "_hash": "ad95a287714ddb01af183c1335b0a3894714ea07ccfaa4a82e63f0839060dea4"
//     },
//     {
//       "proRegTxHash": "6143ba8d26de585c9f700b7e87c40ab25176f756328163f8345df0814c0e822a",
//       "confirmedHash": "04f70d1d03d7bf236ba48813a29bdbcd9497744d4c049efcb2ee9894c1103a4d",
//       "service": "127.0.0.1:15960",
//       "pubKeyOperator": "91ddf4953701dd70ac9011612d1007ab0cdc2aea3bbb59ab4b2f46d5a3e0cbce6d184abd15a069da01f0d4c46cc45bfe",
//       "votingAddress": "yh7JUct77uEPsF5xUdDAxVEieFkUrAKjv9",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 1,
//       "platformHTTPPort": 20715,
//       "platformNodeID": "4c9b675fb7ce467f6b56070ac1158babc278d880",
//       "_hash": "f45c3d84bff79d11bfc7691a1a061a43139973e26e316fca52309418b05fbf2c"
//     },
//     {
//       "proRegTxHash": "bf976bada257bcce79c56534e16dd5def6b448f0ca0e2a9cda5899f29b06162d",
//       "confirmedHash": "208b7d58215237c367ff320b6b3b0a64a67b1e5785137abd62e1a3097f0f4095",
//       "service": "127.0.0.1:15952",
//       "pubKeyOperator": "80fa608adf5ccac7db93a1c4d71c45d7b5ba5b891696e0e5ae91e7b79aced04e25fe9a308d098935794972a751517b17",
//       "votingAddress": "yb2WGvBF7j9TZRJ773cCmgqNSTM5cfaFXt",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 0,
//       "_hash": "8b9a90fb5763f94c6779b1ce09416758db312724c7a2a14a9b04165818857b0d"
//     },
//     {
//       "proRegTxHash": "bc68a472f185ddca13d4a20edf147093efcc6f3168ee1c4a4a93e63a6879a52f",
//       "confirmedHash": "6735e58ff34b1562fa09f3c349151c9a31821d217587ce3b795fb92dc3e0f4d2",
//       "service": "127.0.0.1:15953",
//       "pubKeyOperator": "b648d2a4cca8160bdfd2cf57a7054b9d78083092a4f592b3b56486ac2ff0a9eec6dc2e088dcff4f2fcd897239cf2c890",
//       "votingAddress": "yLpVPTpA6BWTSFSd4ue9FhrMD9ubQq1JJp",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 0,
//       "_hash": "2ddea6e4f8f90dcfbe96d7491fa8b53bdd78e5f405083480d525a579c710d918"
//     },
//     {
//       "proRegTxHash": "643677f041ca0a368f03e1d7c33afa43ee826ce0cb6960f8e09405c438995174",
//       "confirmedHash": "065e1723fe995955087522fc64867655c7e6af25065125c54d4746b3f2ca0dbb",
//       "service": "127.0.0.1:15956",
//       "pubKeyOperator": "a7ef027b4f84c3f7503c8799a2e1120e31da28c470e9f5ac3478059a51f033693438c70fdce224e8875717954a9c5c0d",
//       "votingAddress": "yRsieiKRZwwgbFRucbrG4ZbpNGSPj3YTm3",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 1,
//       "platformHTTPPort": 56454,
//       "platformNodeID": "02102f4edef824146e46cd3baef503b166f6fa9f",
//       "_hash": "d75e598cca598f6c5ef74f60a3d4b6d501b0bec34c216e951514dd47b281eb8c"
//     },
//     {
//       "proRegTxHash": "3a20265088bad257a53665f7ab8d6d6f7515263a6f0a4765871bc59da5159b7a",
//       "confirmedHash": "41fa8082b2a50fece2af40565bbc3a19a48ed9cf453d0f24d8828e047d7a4207",
//       "service": "127.0.0.1:15959",
//       "pubKeyOperator": "96552b9dd94ed604797f28e138e3c8adb502610c3bc4ba33f26fbb9ad9fb8767268fb97d1dfb236c1c21e712e3fd10f3",
//       "votingAddress": "yNEzrm8DH4jFusePiMwDF2W33ZzyMjvPPC",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 1,
//       "platformHTTPPort": 63595,
//       "platformNodeID": "381d7b12108329bcbeb8aa86e8ae2ed035483044",
//       "_hash": "f7c07d340b0017f53a9a8db4345dc7f384387f3155912312b600433fb433a46a"
//     },
//     {
//       "proRegTxHash": "0c19d8b1cfc237ba2c2d1dcdde1d4efc6414c62a8ee872d2717a74480745bc3c",
//       "confirmedHash": "04ca970676878c75e9f5cfb99569f0093da383220f5ebf50460793b16df72e17",
//       "service": "127.0.0.1:15958",
//       "pubKeyOperator": "af9bccb5bdda774b3181904dc73a813cdc646b36218ae7783fd18a1d1ed254217f6ceeeb4fde42dd88c546a0b61cad56",
//       "votingAddress": "yQYFxx3dZF4thUvhdjUPS7pwQwTPR4Qat7",
//       "isValid": true,
//       "nVersion": 2,
//       "nType": 1,
//       "platformHTTPPort": 44457,
//       "platformNodeID": "29cb610904db875b857a3e99fa923be559f01e5e",
//       "_hash": "e031e9b3f90524d6a725e401d4230bf1d56a2dc993a4114f0210653ead1e3f38"
//     }
//   ],
//   "nVersion": 2,
//   "deletedQuorums": [
//   ],
//   "newQuorums": [
//     {
//       "version": 3,
//       "llmqType": 100,
//       "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "a4cb3c3d91abdc0139e8117074294e12b5f6f6753b4e9006a2da4de66d556f553fb8de6384d49cf60486f6129b016544",
//       "quorumVvecHash": "fd1a7e34d6c4bcfcc90a3876f3ed33687184557728cf9400dfe662501efdb4e6",
//       "quorumSig": "916bf062e046d060e0cc8e1f670687c5e4b07dbe8cd1f2bd40598d0e013f33e5eb32205ec46fa8c04142ad5cfb455d1a071394420baf6ac67ad149da5905abee76c01555a94d1331cbf9df85a6a11a85be9a6d5817b7b9d6b3db50a5254a0a4f",
//       "membersSig": "85d2ac15f5b77b7be82aff22de5cab155064bc137065d37c43b461049f943e553f0d6e73fafaacaeba74847ea559bcbc19f6b86f11f4d84d7a0e6eb8e4823a821782b5243b7aefaaee1996c9f9ad4bc0f76f14219e539bb049c86479d9e4d6f1",
//       "_hash": "2d638a140e69729f4b508bbfcb4422172983248186906747f11a75131153077a"
//     },
//     {
//       "version": 3,
//       "llmqType": 100,
//       "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "b5babd31d449de42faf3f7c65dda91597fcac0ba7eaf9deaa68a50fc7fa29d8e2e242e35b2daf5d7cb12e951ecdd74bf",
//       "quorumVvecHash": "aa1f14922f5401cfd00d76bf8ccde55e6688bb6d46fa29f42b52011997ff459c",
//       "quorumSig": "8b436a2b30c6c78f581fd40ac9d36607c6a7f7aaf5d9cfe7e9181864d4398c08888fc82e739f0f9ba23c4067a17457b3178eaad3bcfb12ac232709a654313234c5e57df6e85810888ac41be2f7dccaae1868105f38d18fd4ec2d055d8c6564d9",
//       "membersSig": "848e86aaecb529f83f6049ad56fbe630a50d8e5cc45428742c8a5ea34199706e39273664241362401e7abae3bf8eee8a17fbacbaf868c399629cb6fb25443ffd4c02dc3886978217fc6c231aeb2708bae1c715b288c1672588c18d4a9c4fd49e",
//       "_hash": "4fbd5c80bad504a444d489d332a117e518272a671b0b0a2fbee44ee71131e737"
//     },
//     {
//       "version": 3,
//       "llmqType": 102,
//       "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "9005b66a1ff24b02f7531b031893007424b96b1ea297900dec77be02407fe3f31006bf92faa37990eef93ffc59326b42",
//       "quorumVvecHash": "32af0fe97c0fca904b26429c9eff6401854a9c153d92321075942c6336e63b6e",
//       "quorumSig": "8c615dc6cefa673c0edc5caf9dd3a05a4e073ac6cada4bd223dd22ba4e5d2cf954766dea5009f0b1aa43086cbef16dea04ba9068d49b3b8e7ddf35089c78f7b3105bb9791b94b23db481a9b46cf7eef5708a1a84a400dcb7ee0f9fda62cf9d3a",
//       "membersSig": "838a26e9e126f56143c0d1b7857e4a1944dc7af4ff8adb81d23dc6e310281392717eb92c512060bac8ed8ab26aa052010286a9977dbb2fc075501a6fa58146e3803405482d912032e12496816a11b8053c9cb0b1a7c08abd95b37c7e9197910a",
//       "_hash": "2b1c6a61147e6a17ffae0ec4bb91028b88606af7be4ec87153fc550d93c0033a"
//     },
//     {
//       "version": 3,
//       "llmqType": 102,
//       "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "85c29a052798ab2d04276b2b8402467c02377798b73e9fea5bf2f7112a77c657f3eb07cef28736079956df459f06e25a",
//       "quorumVvecHash": "8b896440c6b456d9922260d210f52a8d2a4d42129f23e61d7872fa4e205d9871",
//       "quorumSig": "b0143baac2c0a0c26dfa7cd7045c557d2581ac969f6fe99165161b208f275525079227034d0c3a88dba3c80d03dda30d0a41e589091a31214cf2811f874bc3205db98317a1b75c9fea7f1a377913c3f770d53818b9dcf24cc361a913407c1798",
//       "membersSig": "ae8eb22de43d7027918716c75b256e920d8d842a3ae06955503b9a18558b9df79caf425860b59c01785d5fac9940da6c0c9da51baa0b36c9274d6d0f7ea562f03b1f77706b01dfa7b499ef69a729bb7120683792e340222098fc2b55a47039a3",
//       "_hash": "c7ed620d9c24eafc78d8057b2a68f3bdb16653a6cd94f24ffe5383c565eea9dd"
//     },
//     {
//       "version": 4,
//       "llmqType": 103,
//       "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//       "quorumIndex": 0,
//       "signersCount": 4,
//       "signers": "0f",
//       "validMembersCount": 4,
//       "validMembers": "0f",
//       "quorumPublicKey": "a176ff9596880741135afaae7ff57ef816142a3984f51be112cd39684bc21e7c34fc99d8838cba5bd827e8f991181ae9",
//       "quorumVvecHash": "fe7e88f8e1c977f6ec576bc3c7108767137ffd2c70bbcceb10d4e7dc46644aee",
//       "quorumSig": "b245668edbe4a9714ad88457961f4998666394208e85fc0a2f60adf62b78d801ce336286510c820f21890d69356d5f0a14c4e1b8a1aec5475897329381f0b38ed3be54ad730b01cf4444428233b193c4accbbd505fa873bda16f6bf759693f46",
//       "membersSig": "a19c4c1e0868a08ac467673fa04ead681a5f273c8fdbd4bee9288d5672faeb7cc9d26f9dfd2652fa79fad3ffd59ad1ec10a7e52c8a7fbebd42e13cd5b86412c09e9723d4ef1beef551eb41ab181db10ac666bd75d05b8d1c4624c0da22331ac6",
//       "_hash": "9e675a954f513e3f7d41f15ca8617e52a2c5eec6d376dac0a6f8e513ea7c67e9"
//     },
//     {
//       "version": 4,
//       "llmqType": 103,
//       "quorumHash": "3064da67a2d30946bedad0e0d9b6e4049fa78d6e4707bf3aec8c6ba3eab688d4",
//       "quorumIndex": 1,
//       "signersCount": 4,
//       "signers": "0f",
//       "validMembersCount": 4,
//       "validMembers": "0f",
//       "quorumPublicKey": "a2aa13b48274fc7282275be44a71a75d32946dabb14fc7be170ba068e3a4c42df3751f9e3d6b82cdd300d9d2ddb5dfe0",
//       "quorumVvecHash": "bf1688bf1e769725eeef9a6f5487176920822f25777fdff90add9395cfd961da",
//       "quorumSig": "8cd92c377405ac42bc1f07742317527f1f1387ab416113a5d6757763d6064d40c0af96be558d45d737d0cfd62642ac77197d2959632a56a014382830aaf8106ab13f32da0ea139fc35431e67d198a9d72789fc7fcd7a28c3241a3105511e6517",
//       "membersSig": "a3ab0180100f3e40b72f76659726f71d10ca8c12cdd63ba0cac1e86728dfcefe223ecf5221468da57ad74005172dbbb30cc7b46b69ea0e175cce7c5629911c27810415f543fd184241eeb5757180ef0bd5f73958671eae2da387390b412cfb3d",
//       "_hash": "dc219bd05c2ebbcfb24669348ad64d2e2df4489d9a439b2c1b20cd73fb360677"
//     },
//     {
//       "version": 3,
//       "llmqType": 104,
//       "quorumHash": "7dc4b864ded9d7357562fe100f139a26902f2c9e3bea8f6bca98b86f39470f57",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "8da97873b7c1c28582d04f76d1d7eca0ebb1fa7463105869842e6584aa602d5dfd6e64fc20e3e834da899ec823eb6009",
//       "quorumVvecHash": "ded949aee2e21075af28adc8a83b1ce6c9b4891b254f41fc0099e712954f02d2",
//       "quorumSig": "b0e4f61c95dd888c1fde8c0ca44b897660da7841b77eb595c7a36d1c9cff16cb227ce6d182f10f6beefaec68bc998dd90c3d373895a2b9a66709d41570b226227ad16bd6ad94da3be6e47a7c8ca632e474b871ab91bb479ddefde0fcfe91fd3c",
//       "membersSig": "a3c8e1dee3f38ac4c7bb2b50b3570e3018e9db0bdf014e47caddf5b1a31a23d90030d816644c9984efb54b373df6f9a11566d54f06296dcb870f57b84db46c95f4327c6e39e90b72035f4052a8c4421c112e85cc37962518a3575f4c351288dd",
//       "_hash": "9b66b6ab7b3ee673a394a7cb17b39c33fc078b0268d06e68207b950eb3bcd849"
//     },
//     {
//       "version": 1,
//       "llmqType": 104,
//       "quorumHash": "7adc2609a93446c42b4d47e516a2eb31d8f4e8b9b04817df0eafe9880f18d6f9",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "88f921acfed4c521a767a552e5e88d2339c53acbd82b93cf9f2b7174f45ce0542720da51e8fc39c16c4f6ae8f9710a0c",
//       "quorumVvecHash": "0c79ef244a5bd8d61d007e88cc82768b4a0c7af9ca47fb65d959ea0e12da4404",
//       "quorumSig": "00246e258fc64434b9a1eec923e337b0d6fb557a8ae8688fe0a7e0f866a69912b946bfa8d978d4e1ea81749e8787ac93189c7926047d7e50282c5bfa95ea2ae6b48087b60077f6011961674cf920eed0ec6a732864c553db5110968c0d2f48ed",
//       "membersSig": "1414f4ff42426a520f0fbc48d651f37ca1b17f7e86104bb4037c66c21590b08c729474e1bb868e494c11eb5c82fa61a215d78c89c8cd5ca8df447ed60d76a83d9b82eb474c86ce1f1231d4565d4bab97359f0c5df342c61d6adf805d883269e1",
//       "_hash": "bbb3b74701dd886c7fc0e9259ae8e466c0b8ce7fac5e65fda30fe4bcdcf0bbbf"
//     },
//     {
//       "version": 3,
//       "llmqType": 106,
//       "quorumHash": "0bbcbd78c1bd71fd340c5bb5c62bea72017aa7e255ff459cca6f83390ffbdc60",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "acebd725d48f2c6849949ef4225bb0bfbb329d36a1abaffd92831527d2dae7b66e104b014b1d56e533150f3a39e68ef7",
//       "quorumVvecHash": "c11c125599e9d07583dcac08fa46e387f4cdf07afbf580dab51d5f87e4bf82b4",
//       "quorumSig": "88183e681480923d60aecd5fc9e8115e5a69c0c38bb4c84cd02ce0d3798e0c29ec0ef1ab0d75999ee5ed23c22cb1abb708f8fd62d58ed1f7007d5780853ebe540c50ab103752dfa26d49a7ae93bcf7e2cc30aa31b169fb7c5b3b95378bb2481a",
//       "membersSig": "81d0944f43b2d8121437b0391ec3278bbed2e937749fd7cb9266ed5ed3aa32b4c93307c89e7b1af2592a5675eb0e791107fef366f7f862a7604f6eee30c64084e2a30fc81cd30c252ebcd0bc118975b1bfcf474672741bd05fee8f811ebea61c",
//       "_hash": "6ba9f53ade67980763a1258474a9ed02e656097fecfcea53336eeddace792d15"
//     },
//     {
//       "version": 3,
//       "llmqType": 106,
//       "quorumHash": "39c4ae1db229833f3dbeadf495a75dd71dea761f87ed388f1c1861c54e8e9e82",
//       "quorumIndex": 0,
//       "signersCount": 3,
//       "signers": "07",
//       "validMembersCount": 3,
//       "validMembers": "07",
//       "quorumPublicKey": "a34fbfd901a70a0a3353cbf8f58ef4efd100227ce1347b833f288d3f5cd5451291b958bc5875a48b65af0bbf5509be7f",
//       "quorumVvecHash": "46193832a4cdf47d3044183402a218b51d1141c84e84725a350383ad29d83a55",
//       "quorumSig": "b2cb371e308278df644cb5a0a04b60d488aa2369f16659b1874bed7a8554b8f1b2fd4c5a8068645428a12b56006a38890451bc43eacbe65c35a6d025f94bed2189677b5bb47528f3239f69f04f2eb3b0dba994d8f36020b3f50725d136eec457",
//       "membersSig": "963913504ab0026ba3b7b41f4e54289179b04ed812cff1f4102cd301d40197f3e0a8da091e0b5915b3ef49ebc5100f661142ca047e71aab2c0f07fd6eed627be13788d4b8b1c7b70c5e7d1811d18da21ba2c59a7f5a53aaf83f947ba69cd4405",
//       "_hash": "50dcd3cca90071f366a7755142dcbc8a967c8e66ca867649e40bb5e8e2f3ce0f"
//     }
//   ],
//   "merkleRootMNList": "147ab10895916bf55140bf5afa55a8625636d8891cb315bf66326a24f1da1f23",
//   "merkleRootQuorums": "d7b117c5679851a218a2f25b3837bebd025048a44b56a122aeb6bf1620a00503"
// };
//
// const diffRaw2 = {
//   baseBlockHash: '0b9df2d525b5a986c91d8fd9ee5b2464772b79a8b7c1a876c3643380dc56e260',
//   blockHash: '4def55ffb15626e036273df09fb0bc2162cc8e574dd9fade1a77bda1a5a94a3c',
//   cbTxMerkleTree: '01000000013337e777b7508a54c79a56bd8f0abad0730a6d9bea901fe84b44dbf63bae8f380101',
//   cbTx: '03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff0502cb040101ffffffff0268ef48e5020000001976a9144e9966f8c90508a43e41872f478540dd4716079888ac5fef48e5020000001976a91436a65860bf0533ca347a43a5d3340d606c9eeef588ac00000000460200cb040000e290c7f9e5d8ac967b07f074af7904363194a988e2155d497a62a67e037b0f610000000000000000000000000000000000000000000000000000000000000000',
//   deletedMNs: [],
//   mnList: [
//     {
//       proRegTxHash: 'cefe2ff74359e35924a1fa1a5215e538052854683f9c930abe5069814dd610c6',
//       confirmedHash: '6c0a26d20ab9e4deac5bb399582e602a6ef2daaa82454f2ba0be52087b361d38',
//       service: '192.168.65.2:20201',
//       pubKeyOperator: '8615c5d1976e0610ea811de20cc804815341af4751ae37d6012f38c5f23ae8fa520c4dcdfc54d690e1cc9c8b769ec9f0',
//       votingAddress: 'yRihLHo8LXrmKe2ht76m9eFSjaWaBtGU9x',
//       isValid: true,
//       nVersion: 2,
//       nType: 1,
//       platformHTTPPort: 3200,
//       platformNodeID: 'fe84df23e1a7f1db40e8e3fd3a4d88662bf0d89d',
//       payoutAddress: 'yPb5LdXyiWPXftPw52wz7hfrFARNJiah37'
//     },
//     {
//       proRegTxHash: '0f156c3f4ff4a21e05e345ebb311ab161500bdf49c32edcd58a40e35438ab4aa',
//       confirmedHash: '2367152a6b3cffd11aab22ac3d66176cb9a898e58d7dad7c416732cc4d91118f',
//       service: '192.168.65.2:20001',
//       pubKeyOperator: '88108ec6804368b5b9fe6ce0f6ffb99a9b8ccd964d93569d8b9975bdedbb1473a6b9be97704963d9e400a31fc04ac869',
//       votingAddress: 'yhPC58kkD9opAbdnCYUg3RX8Z34FNRdpdt',
//       isValid: true,
//       nVersion: 2,
//       nType: 1,
//       platformHTTPPort: 3000,
//       platformNodeID: '4859d04cb1bbf33ba476532e97cb89e299b10a23',
//       payoutAddress: 'yRJQcRwbpX8L5Sh6HQkLy3pcNb2HM9oH9W'
//     },
//     {
//       proRegTxHash: '5cfcd773a356f6cb3d8f15e1d30607375785af866ccc9c1ccb255d91de01fb3c',
//       confirmedHash: '59d75bb8294bbb30e0c3249df0fa4fca5a493a4fe45f1b880682d1f90c3fe114',
//       service: '192.168.65.2:20101',
//       pubKeyOperator: '9699ab51d63e32477c52fa410bc79a79ef8d621ff23ec573e4adf9e250f20aeabf657331ab586a659a7cbbfcd3c3bf5b',
//       votingAddress: 'yT8dgQXGKGqLnGDryBYfdHDw6X8RjgdKpD',
//       isValid: true,
//       nVersion: 2,
//       nType: 1,
//       platformHTTPPort: 3100,
//       platformNodeID: 'e3d273fca2239545c5ef81e29f816aeb99ba9d0a',
//       payoutAddress: 'yVvxc1MU8H2CBRHeCN3TeYKiFNXx9q1Jtg'
//     }
//   ],
//   nVersion: 2,
//   deletedQuorums: [],
//   newQuorums: [],
//   merkleRootMNList: '610f7b037ea6627a495d15e288a99431360479af74f0077b96acd8e5f9c790e2',
//   merkleRootQuorums: '0000000000000000000000000000000000000000000000000000000000000000'
// }
//
// const crypto = require('crypto');
//
// const diff = new SimplifiedMNListDiff(diffRaw);
//
// console.log(crypto.createHash('sha256').update(diff.toBuffer()).digest().toString('hex'));
//
// console.log(crypto.createHash('sha256').update(diff.copy().toBuffer()).digest().toString('hex'));
//
// new SimplifiedMNList(diff);

module.exports = SimplifiedMNList;
