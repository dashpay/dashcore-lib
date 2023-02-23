const _ = require('lodash');
const BufferReader = require('../encoding/bufferreader');
const BufferWriter = require('../encoding/bufferwriter');
const BufferUtil = require('../util/buffer');
const $ = require('../util/preconditions');
const Hash = require('../crypto/hash');
const constants = require('../constants');
const utils = require('../util/js');
const ipUtils = require('../util/ip');
const Address = require('../address');
const Networks = require('../networks');

const isSha256 = utils.isSha256HexString;
const { isHexStringOfSize } = utils;
const isHexString = utils.isHexaString;
const parseIp = ipUtils.bufferToIPAndPort;
const serializeIp = ipUtils.ipAndPortToBuffer;

const {
  SHA256_HASH_SIZE,
  BLS_PUBLIC_KEY_SIZE,
  PUBKEY_ID_SIZE,
  PLATFORM_NODE_ID_SIZE,
  SML_HPMN_TYPE,
} = constants;

/**
 * @typedef {Object} SMLEntry
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {number} [nVersion]
 * @property {number} [nType]
 * @property {number} [platformHTTPPort]
 * @property {string} [platformNodeID]
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */

/**
 * @class SimplifiedMNListEntry
 * @param {string|Object|Buffer} arg - A Buffer, JSON string, or Object representing a SmlEntry
 * @param {string} [network]
 * @constructor
 * @property {string} proRegTxHash
 * @property {string} confirmedHash
 * @property {string} service - ip and port
 * @property {string} pubKeyOperator - operator public key
 * @property {string} votingAddress
 * @property {boolean} isValid
 * @property {number} [nVersion]
 * @property {number} [nType]
 * @property {string} [platformHTTPPort]
 * @property {number} [platformNodeID]
 * @property {string} [payoutAddress]
 * @property {string} [operatorPayoutAddress]
 */
function SimplifiedMNListEntry(arg, network) {
  if (arg) {
    const validNetwork = Networks.get(network);

    if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    }
    if (BufferUtil.isBuffer(arg)) {
      return SimplifiedMNListEntry.fromBuffer(arg, validNetwork);
    }
    if (_.isObject(arg)) {
      return SimplifiedMNListEntry.fromObject(arg);
    }
    if (arg instanceof SimplifiedMNListEntry) {
      return arg.copy();
    }
    if (isHexString(arg)) {
      return SimplifiedMNListEntry.fromHexString(arg, validNetwork);
    }
    throw new TypeError('Unrecognized argument for SimplifiedMNListEntry');
  }
}

/**
 * Parse buffer and returns SimplifiedMNListEntry
 * @param {Buffer} buffer
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromBuffer = function fromBuffer(buffer, network) {
  const bufferReader = new BufferReader(buffer);

  const object = { };

  object.proRegTxHash = bufferReader.read(SHA256_HASH_SIZE).reverse().toString('hex');
  object.confirmedHash = bufferReader
      .read(SHA256_HASH_SIZE)
      .reverse()
      .toString('hex');
  object.service = parseIp(bufferReader.read(ipUtils.IP_AND_PORT_SIZE));
  object.pubKeyOperator = bufferReader.read(BLS_PUBLIC_KEY_SIZE).toString('hex');
  object.votingAddress = Address.fromPublicKeyHash(
      bufferReader.read(PUBKEY_ID_SIZE),
      network
    ).toString();

  object.isValid = Boolean(bufferReader.readUInt8());

  // In case of version 2, sml entry should contain more fields but
  // we don't know version here

  // TODO: better use !reader.finished()

  try {
    object.nType = bufferReader.readUInt16LE();
  } catch (e) {
    // nothing
  }

  if (object.nType === SML_HPMN_TYPE) {
    object.nVersion = 2;
    object.platformHTTPPort = bufferReader.readUInt16LE();
    object.platformNodeID = bufferReader.read(PLATFORM_NODE_ID_SIZE).reverse().toString('hex');
  }

  return SimplifiedMNListEntry.fromObject(object);
};

/**
 * @param {string} string
 * @param {string} [network]
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromHexString = function fromHexString(string, network) {
  return SimplifiedMNListEntry.fromBuffer(Buffer.from(string, 'hex'), network);
};

/**
 * Serialize SML entry to buffer
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.toBuffer = function toBuffer() {
  this.validate();
  const bufferWriter = new BufferWriter();

  bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex').reverse());
  bufferWriter.write(Buffer.from(this.confirmedHash, 'hex').reverse());
  bufferWriter.write(serializeIp(this.service));
  bufferWriter.write(Buffer.from(this.pubKeyOperator, 'hex'));
  bufferWriter.write(
    Buffer.from(Address.fromString(this.votingAddress).hashBuffer, 'hex')
  );
  bufferWriter.writeUInt8(Number(this.isValid));

  if (typeof this.nType === 'number') {
    bufferWriter.writeUInt16LE(this.nType);

    if (this.nType === SML_HPMN_TYPE) {
      bufferWriter.writeUInt16LE(this.platformHTTPPort);
      bufferWriter.write(Buffer.from(this.platformNodeID, 'hex').reverse());
    }
  }

  return bufferWriter.toBuffer();
};

/**
 * Create SMLEntry from an object
 * @param {SMLEntry} obj
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.fromObject = function fromObject(obj) {
  const SMLEntry = new SimplifiedMNListEntry();
  SMLEntry.proRegTxHash = obj.proRegTxHash;
  SMLEntry.confirmedHash = obj.confirmedHash;
  SMLEntry.service = obj.service;
  SMLEntry.pubKeyOperator = obj.pubKeyOperator;
  SMLEntry.votingAddress = obj.votingAddress;
  SMLEntry.isValid = obj.isValid;
  SMLEntry.nVersion = obj.nVersion;
  SMLEntry.nType = obj.nType;
  SMLEntry.platformHTTPPort = obj.platformHTTPPort;
  SMLEntry.platformNodeID = obj.platformNodeID;
  SMLEntry.payoutAddress = obj.payoutAddress;
  SMLEntry.operatorPayoutAddress = obj.operatorPayoutAddress;
  SMLEntry.network = Address.fromString(obj.votingAddress).network;

  SMLEntry.validate();

  return SMLEntry;
};

SimplifiedMNListEntry.prototype.validate = function validate() {
  $.checkArgument(
    isSha256(this.proRegTxHash),
    'Expected proRegTxHash to be a sha256 hex string'
  );
  $.checkArgument(
    isSha256(this.confirmedHash),
    'Expected confirmedHash to be a sha256 hex string'
  );
  if (!ipUtils.isZeroAddress(this.service)) {
    $.checkArgument(
      ipUtils.isIPV4(this.service),
      'Expected service to be a string with ip address and port'
    );
  }
  $.checkArgument(
    isHexStringOfSize(this.pubKeyOperator, BLS_PUBLIC_KEY_SIZE * 2),
    'Expected pubKeyOperator to be a pubkey id'
  );
  $.checkArgument(
    Address.isValid(this.votingAddress),
    'votingAddress is not valid'
  );
  $.checkArgument(
    typeof this.isValid === 'boolean',
    'Expected isValid to be a boolean'
  );
  $.checkArgument(
    typeof this.nType === 'number',
    'Expected nType to be a number'
  );

  if (this.nType === constants.SML_HPMN_TYPE) {
    $.checkArgument(
      typeof this.platformHTTPPort === 'number',
      'Expected platformHTTPPort to be a number'
    );

    $.checkArgument(
      typeof this.platformNodeID === 'string',
      'Expected platformNodeID to be a string'
    );
  }
};

SimplifiedMNListEntry.prototype.toObject = function toObject() {
  const result = {
    proRegTxHash: this.proRegTxHash,
    confirmedHash: this.confirmedHash,
    service: this.service,
    pubKeyOperator: this.pubKeyOperator,
    votingAddress: this.votingAddress,
    isValid: this.isValid,
    nVersion: this.nVersion,
  };

  if (this.nType) {
    result.nType = this.nType;
  }

  if (this.payoutAddress) {
    result.payoutAddress = this.payoutAddress;
  }

  if (this.operatorPayoutAddress) {
    result.operatorPayoutAddress = this.operatorPayoutAddress;
  }

  if (this.platformHTTPPort) {
    result.platformHTTPPort = this.platformHTTPPort;
  }

  if (this.platformNodeID) {
    result.platformNodeID = this.platformNodeID;
  }

  return result;
};

/**
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.calculateHash = function calculateHash() {
  return Hash.sha256sha256(this.toBuffer());
};

/**
 * Gets the ip from the service property
 * @return {string}
 */
SimplifiedMNListEntry.prototype.getIp = function getIp() {
  return this.service.split(':')[0];
};

/**
 * Serialize confirmed hash with proRegTxHash for MN scores
 * and quorum member selection
 * @return {Buffer}
 */
SimplifiedMNListEntry.prototype.confirmedHashWithProRegTxHash =
  function confirmedHashWithProRegTxHash() {
    const bufferWriter = new BufferWriter();
    bufferWriter.write(Buffer.from(this.confirmedHash, 'hex'));
    bufferWriter.write(Buffer.from(this.proRegTxHash, 'hex'));
    return Hash.sha256(bufferWriter.toBuffer().reverse()).reverse();
  };

/**
 * Creates a copy of SimplifiedMNListEntry
 * @return {SimplifiedMNListEntry}
 */
SimplifiedMNListEntry.prototype.copy = function copy() {
  return SimplifiedMNListEntry.fromBuffer(this.toBuffer(), this.network);
};

// const entities = [
//   {
//     "proRegTxHash": "d7d5451c5c0264e80809ba692e7dc013352c1ef70c5a5827a82c33da0227a627",
//     "confirmedHash": "5a557a636e8ee6f970244139303b389532ea8e597970c6e4bc423a99653e14d7",
//     "service": "127.0.0.1:11966",
//     "pubKeyOperator": "b716496ffbd63d7e799bd0cc2d1a0c11a2152696f42826a30d48517831d9bd0bca43a70313927c6cc69fd140d29c6541",
//     "votingAddress": "yfH7m5THC3R9YeGsTP1hcRYUBndVEveMCt",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 1,
//     "platformHTTPPort": 42682,
//     "platformNodeID": "f5bed32eb2fdfc994fd81549e05717d0fc3e55e0",
//     "_hash": "4113f0049f5c98aac80782889477703f5727a142e07c339b676fd3ba511cca30"
//   },
//   {
//     "proRegTxHash": "e41fc38d2510e6ff3d3d29ddb79c979d2e18f849a0d5326abc4bb71d26dddb09",
//     "confirmedHash": "0cec67678ae3c097e20b19125a9c5c95ae92cbe015bffb6ae2578d7d00c91e82",
//     "service": "127.0.0.1:11964",
//     "pubKeyOperator": "8ccc76cc900cc28761837c0aeafec46441b00bad1e2ee75e4c146b309ed12b171702fb1eadb72322570688f86e0786e4",
//     "votingAddress": "yfk7rAfmazgVqvtMjmqEXtDn6emtY8kpJE",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 1,
//     "platformHTTPPort": 27579,
//     "platformNodeID": "73a75a83b2b8650635863589772503393af23280",
//     "_hash": "a50f8412caab534647ba6baa66a9319d4cb79e42922aa97568efed2ff9f93e32"
//   },
//   {
//     "proRegTxHash": "2baebdd6dd678219e6c8765a2f256a03dd41e67b2a287ecf7830be314e2e12b7",
//     "confirmedHash": "10f641e2f0f7aeb5d73759262a95d6efc04b793fabcf7a79c9bc5b82bcb0ee77",
//     "service": "127.0.0.1:11960",
//     "pubKeyOperator": "b67662b3414cb37941e75831c0072258f6f6d2efcbc5e8fe32d8ee6255f4db169f52e65ecc3575f2b680bf5aeb7f39c4",
//     "votingAddress": "yUPHnzTfvHvkh4TuLAy8argVRn2xivyLYQ",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 0,
//     "_hash": "2babeb3e1923f6d77f0a37c47a0ac753cf722562eb0454e1a08453f6091bb7ae"
//   },
//   {
//     "proRegTxHash": "e7d8ba9c284265936f3f79c889f106802c235cd2819eca2a6bbb0d5939750bda",
//     "confirmedHash": "5d501756e1e24918ef8dce2c56b56035699631d1dcb143665f18f136aef56677",
//     "service": "127.0.0.1:11962",
//     "pubKeyOperator": "801fe371c7bef00a6eb70b9a077d97b668a6b6493945b62d9970f9df51f07ddf071833b69610244bc0d139a570af7cd1",
//     "votingAddress": "yj22m34ScQRqagGwCECp8hWcayurniJp4S",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 1,
//     "platformHTTPPort": 36927,
//     "platformNodeID": "18caa38e3e824091b7fd702069f4639ea4c5de35",
//     "_hash": "40a239ec1a4946406d4cd53d54cd64b91b4079e8ccba52976269c0e7224e78d2"
//   },
//   {
//     "proRegTxHash": "f83e31ff3debc7e65003a122eea83b8413b79ee42d678af37a8824caac3558dd",
//     "confirmedHash": "444a38f87b45785d55a2074ec68dfe6945837ef88e38105dd04d935850b8a0dd",
//     "service": "127.0.0.1:11963",
//     "pubKeyOperator": "8287f95a09375f72f00b00e3e80ad4740406960c8fdd058705e6769e835ff8732bbfa9d7afa6199061e4f7801a0fcf98",
//     "votingAddress": "yUkjtUfH7eP4P25koPcQSKt5CXYYSQfpje",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 1,
//     "platformHTTPPort": 44584,
//     "platformNodeID": "c981fa36b12720a6ad4ced70484d817e88369329",
//     "_hash": "b24c9d70e36332da11221fb681d35327afa00c196f8f07875c2b244568cf61d2"
//   },
//   {
//     "proRegTxHash": "1fd4aef8a6353d0c4aa47a22ae6df5375f428297700399ab3579e702bdcbec3e",
//     "confirmedHash": "2302d15c1af67bc4041fe9a77e8f81b0a9484af5f6e16b49a8c382858009569f",
//     "service": "127.0.0.1:11958",
//     "pubKeyOperator": "a189965954a6d1ce6e52c91d73d560753935f1e3a7f5ec1f15f5f524d77ef91100782e75f37fbbeabb1464604a2a6b9a",
//     "votingAddress": "ygQnkyuANURa6vtGzNaEefQMBeoYwT6oNU",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 0,
//     "_hash": "57813a14967d4f9729bb26d07e7e00051fbca9125786f954b71566227bd80645"
//   },
//   {
//     "proRegTxHash": "d3d675b35fbe29f7ea5a62511c30eccdd77a0d069d68d5277727aaa8370f757f",
//     "confirmedHash": "2ac4daac245ba09b629eac64c0938795ca88db2c4ec078f4735d226ee2e65aa7",
//     "service": "127.0.0.1:11965",
//     "pubKeyOperator": "b2e1017642633ad243f3cdb3beb04b487970bb3bfa845c48d08a78d868c30edc86ff96080366d51af78828b1902c32d2",
//     "votingAddress": "yfLbQ6SibPsEmoEkTRgP8qZbm1d1aBG1nc",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 1,
//     "platformHTTPPort": 43603,
//     "platformNodeID": "a347b0ef7533bf8768315fdcf823d55fc140ba76",
//     "_hash": "ba3b42d1fd9af93a5e8709f81102b92e34491a7a1df9bde13f6de72a9e044098"
//   },
//   {
//     "proRegTxHash": "6715addd32b49953bef3982c313b513dbd1b7670a72a187140fbd32c24ce0c19",
//     "confirmedHash": "6fd2eb3485b2fac3d3f771fcc2fc84ce9b50c493ea834cceb635bd443cc85a38",
//     "service": "127.0.0.1:11959",
//     "pubKeyOperator": "af302f50d853378dc67bc581e1d97dd911a97a7fea86fd549663903d9a61f51e16f3eed2566cd1c80a60d847bf94b8b1",
//     "votingAddress": "yQBZuNJr6UtLpGsVQhDdW24c3axHwJaopM",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 0,
//     "_hash": "23bcd498d21667e33fdbcdc127292b8964fdd6693547e6819e836b27194b4fd8"
//   },
//   {
//     "proRegTxHash": "620811a83c3be8506a358b1a41bf877e0d27081eb864f392f5d2df3401a323b9",
//     "confirmedHash": "3dd24b5779f7a71ba8a09089442e9b5fbd49a67ab3af13e31f428e199c566005",
//     "service": "127.0.0.1:11961",
//     "pubKeyOperator": "908849b04186aec50942fa87bc663b2efc8162c5dc129ba0340c06e5c3823195388c2938114d809af2abfcf7a2106a2e",
//     "votingAddress": "yZikQiFwBL7pEnSVnwVm98mTjojXJABc36",
//     "isValid": true,
//     "nVersion": 2,
//     "nType": 0,
//     "_hash": "494e784a6fb4797aab1cdf47cbbfb5c3b59b55c9932f8c4a64b19d51581dc3f2"
//   }
// ];
// const assert = require('assert');
// entities.forEach((entityRaw) => {
//   const entity = new SimplifiedMNListEntry(entityRaw);
//   console.log(entity.calculateHash().reverse().toString('hex'))
//   console.log(entityRaw._hash)
//   console.log(crypto.createHash('sha256').update(entity.toBuffer()).digest().toString('hex'));
//   console.log(crypto.createHash('sha256').update(entity.copy().toBuffer()).digest().toString('hex'));
//
//   console.log('\n');
//   console.log('\n');
//   });

module.exports = SimplifiedMNListEntry;
