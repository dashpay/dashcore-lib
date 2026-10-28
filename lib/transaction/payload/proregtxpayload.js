/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var _ = require('lodash');
var utils = require('../../util/js');
var constants = require('../../constants');
var Preconditions = require('../../util/preconditions');
var BufferWriter = require('../../encoding/bufferwriter');
var BufferReader = require('../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var Script = require('../../script');
var ipUtil = require('../../util/ip');
var BN = require('../../crypto/bn');
var netInfo = require('../../util/netinfo');
var payouts = require('./masternodepayouts');
const { PLATFORM_NODE_ID_SIZE,
  MASTERNODE_TYPE_BASIC,
  MASTERNODE_TYPE_HP,
  PROTX_EXT_ADDR_VERSION,
  COMPACT_SIGNATURE_SIZE,
} = require("../../constants");

var CURRENT_PAYLOAD_VERSION = 2;
// Core writes the share count as one byte
var MAX_SHARES_COUNT = 0xff;

/**
 * @typedef {Object} ProRegTxPayloadJSON
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} [type] Masternode type, regular (0) if omitted
 * @property {string} collateralHash
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} [service] - service address, ip and port. Before version 3
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose. From version 3
 * @property {string} keyIDOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} pubKeyOperator	BLSPubKey	48	The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} [payoutAddress] Before version 3
 * @property {MasternodePayoutJSON[]} [payouts] Owner payees with their reward shares. From version 3
 * @property {CollateralShareJSON[]} [shares] Collateral shares of a shared masternode. From version 3
 * @property {string[]} [joinSigs] One compact signature per share. From version 3
 * @property {number} [earlyPeriodBlocks] From version 3
 * @property {number} [earlyPenalty] In duffs. From version 3
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port. Before version 3
 * @property {number} [platformHTTPPort] Platform HTTP port. Before version 3
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with keyIDOwner
 */

/**
 * @typedef {Object} CollateralShare
 * @property {number} amount - contributed collateral in duffs
 * @property {string} scriptRefund - refund script (p2pkh/p2sh)
 * @property {string} scriptReward - reward script (p2pkh/p2sh), empty to reward scriptRefund
 * @property {string} keyIDOwner - the share owner's public key hash
 */

/**
 * @typedef {Object} CollateralShareJSON
 * @property {number} amount - contributed collateral in duffs
 * @property {string} refundAddress
 * @property {string} [rewardAddress] - omitted when rewards go to refundAddress
 * @property {string} keyIDOwner - the share owner's public key hash
 */

/**
 * @class ProRegTxPayload
 * @property {number} version	uint_16	2	Provider transaction version number. Currently set to 1.
 * @property {number} type
 * @property {number} mode
 * @property {string} collateralHash
 * @property {number} collateralIndex	uint_32	4	The collateral index.
 * @property {string} [service] - service address, ip and port. Before version 3
 * @property {Object<string, string[]>} [addresses] - "addr:port" lists by purpose. From version 3
 * @property {string} keyIDOwner	CKeyID	20	The public key hash used for owner related signing (ProTx updates, governance voting)
 * @property {string} pubKeyOperator	BLSPubKey	48	The public key used for operational related signing (network messages, ProTx updates)
 * @property {string} keyIDVoting	CKeyID	20	The public key hash used for voting.
 * @property {number} operatorReward	uint_16	2	A value from 0 to 10000.
 * @property {string} [scriptPayout]	Script	Variable	Payee script (p2pkh/p2sh). Before version 3
 * @property {MasternodePayout[]} [payouts] Owner payees with their reward shares. From version 3
 * @property {CollateralShare[]} [shares] Collateral shares of a shared masternode. From version 3
 * @property {string[]} [joinSigs] One 65 byte compact signature per share. From version 3
 * @property {number} [earlyPeriodBlocks] uint_32. From version 3
 * @property {number} [earlyPenalty] In duffs. From version 3
 * @property {string} inputsHash	uint256	32	Hash of all the outpoints of the transaction inputs
 * @property {string} [platformNodeID] Platform Node ID
 * @property {number} [platformP2PPort] Platform P2P port. Before version 3
 * @property {number} [platformHTTPPort] Platform HTTP port. Before version 3
 * @property {number} [payloadSigSize] Size of the Signature
 * @property {string} [payloadSig] Signature of the hash of the ProTx fields. Signed with keyIDOwner
 */
function ProRegTxPayload(options) {
  AbstractPayload.call(this);
  this.version = CURRENT_PAYLOAD_VERSION;

  if (options) {
    if (options.version !== undefined) {
      this.version = options.version;
    }
    this.type = options.type !== undefined ? options.type : MASTERNODE_TYPE_BASIC;
    this.mode = options.mode !== undefined ? options.mode : 0;
    this.collateralHash = options.collateralHash;
    this.collateralIndex = options.collateralIndex;
    this.keyIDOwner = options.keyIDOwner;
    this.pubKeyOperator = options.pubKeyOperator;
    this.keyIDVoting = options.keyIDVoting;
    this.operatorReward = options.operatorReward;
    if (this.version >= PROTX_EXT_ADDR_VERSION) {
      this.addresses = _.cloneDeep(options.addresses);
      this.payouts = payouts.payoutsFromJSON(options);
      this.shares = sharesFromJSON(options.shares || []);
      this.joinSigs = (options.joinSigs || []).slice();
      this.earlyPeriodBlocks = options.earlyPeriodBlocks || 0;
      this.earlyPenalty = options.earlyPenalty || 0;
    } else {
      this.service = options.service;
      this.scriptPayout = Script.fromAddress(options.payoutAddress).toHex();
    }
    this.inputsHash = options.inputsHash;
    this.platformNodeID = options.platformNodeID;
    if (this.version < PROTX_EXT_ADDR_VERSION) {
      this.platformP2PPort = options.platformP2PPort;
      this.platformHTTPPort = options.platformHTTPPort;
    }
    this.payloadSig = options.payloadSig;
    this.payloadSigSize = this.payloadSig
      ? Buffer.from(this.payloadSig, 'hex').length
      : 0;
  }
}

ProRegTxPayload.prototype = Object.create(AbstractPayload.prototype);
ProRegTxPayload.prototype.constructor = AbstractPayload;

/**
 * @param {CollateralShareJSON[]} sharesJSON
 * @return {CollateralShare[]}
 */
function sharesFromJSON(sharesJSON) {
  Preconditions.checkArgument(
    Array.isArray(sharesJSON),
    'Expect shares to be an array'
  );
  return sharesJSON.map(function (share) {
    return {
      amount: share.amount,
      scriptRefund: Script.fromAddress(share.refundAddress).toHex(),
      scriptReward: share.rewardAddress
        ? Script.fromAddress(share.rewardAddress).toHex()
        : '',
      keyIDOwner: share.keyIDOwner,
    };
  });
}

/**
 * @param {CollateralShare[]} shares
 * @param {Network|string} [network]
 * @return {CollateralShareJSON[]}
 */
function sharesToJSON(shares, network) {
  return shares.map(function (share) {
    var shareJSON = {
      amount: share.amount,
      refundAddress: new Script(share.scriptRefund)
        .toAddress(network)
        .toString(),
      keyIDOwner: share.keyIDOwner,
    };
    if (share.scriptReward) {
      shareJSON.rewardAddress = new Script(share.scriptReward)
        .toAddress(network)
        .toString();
    }
    return shareJSON;
  });
}

/**
 * Validate the collateral shares of a version 3 payload
 * @param {ProRegTxPayload} payload
 */
function validateShares(payload) {
  Preconditions.checkArgument(
    Array.isArray(payload.shares) && payload.shares.length <= MAX_SHARES_COUNT,
    'Expect shares to be an array of at most 255 shares'
  );
  Preconditions.checkArgument(
    Array.isArray(payload.joinSigs) &&
      payload.joinSigs.length === payload.shares.length,
    'Expect one join signature per share'
  );
  payload.shares.forEach(function (share) {
    Preconditions.checkArgument(
      Number.isSafeInteger(share.amount) && share.amount >= 0,
      'Expect share amount to be an unsigned integer'
    );
    Preconditions.checkArgument(
      payouts.isPayoutScript(share.scriptRefund),
      'Expected share scriptRefund to be a p2pkh/p2sh'
    );
    Preconditions.checkArgument(
      share.scriptReward === '' || payouts.isPayoutScript(share.scriptReward),
      'Expected share scriptReward to be empty or a p2pkh/p2sh'
    );
    Preconditions.checkArgument(
      utils.isHexStringOfSize(share.keyIDOwner, constants.PUBKEY_ID_SIZE * 2),
      'Expect share keyIDOwner to be 20 bytes in size'
    );
  });
  payload.joinSigs.forEach(function (joinSig) {
    Preconditions.checkArgument(
      utils.isHexStringOfSize(joinSig, COMPACT_SIGNATURE_SIZE * 2),
      'Expect join signatures to be 65 bytes in size'
    );
  });
  Preconditions.checkArgument(
    utils.isUnsignedInteger(payload.earlyPeriodBlocks) &&
      payload.earlyPeriodBlocks <= 0xffffffff,
    'Expect earlyPeriodBlocks to be an uint32'
  );
  Preconditions.checkArgument(
    Number.isSafeInteger(payload.earlyPenalty) && payload.earlyPenalty >= 0,
    'Expect earlyPenalty to be an unsigned integer'
  );
}

/* Static methods */

/**
 * Parse raw payload
 * @param {Buffer} rawPayload
 * @return {ProRegTxPayload}
 */
ProRegTxPayload.fromBuffer = function fromBuffer(rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new ProRegTxPayload();

  payload.version = payloadBufferReader.readUInt16LE();
  payload.type = payloadBufferReader.readUInt16LE();
  payload.mode = payloadBufferReader.readUInt16LE();
  // readReverse copies: reversing a read() slice in place would modify rawPayload
  payload.collateralHash = payloadBufferReader
    .readReverse(constants.SHA256_HASH_SIZE)
    .toString('hex');
  payload.collateralIndex = payloadBufferReader.readUInt32LE();
  if (payload.version >= PROTX_EXT_ADDR_VERSION) {
    payload.addresses = netInfo.readExtNetInfo(payloadBufferReader);
  } else {
    payload.service = ipUtil.bufferToIPAndPort(
      payloadBufferReader.read(ipUtil.IP_AND_PORT_SIZE)
    );
  }

  payload.keyIDOwner = payloadBufferReader
    .readReverse(constants.PUBKEY_ID_SIZE)
    .toString('hex');
  payload.pubKeyOperator = payloadBufferReader
    .read(constants.BLS_PUBLIC_KEY_SIZE)
    .toString('hex');
  payload.keyIDVoting = payloadBufferReader
    .readReverse(constants.PUBKEY_ID_SIZE)
    .toString('hex');

  payload.operatorReward = payloadBufferReader.readUInt16LE();
  if (payload.version >= PROTX_EXT_ADDR_VERSION) {
    payload.payouts = payouts.readPayouts(payloadBufferReader);
    var sharesCount = payloadBufferReader.readUInt8();
    payload.shares = [];
    for (var i = 0; i < sharesCount; i++) {
      payload.shares.push({
        amount: payloadBufferReader.readUInt64LEBN().toNumber(),
        scriptRefund: payloadBufferReader.readVarLengthBuffer().toString('hex'),
        scriptReward: payloadBufferReader.readVarLengthBuffer().toString('hex'),
        keyIDOwner: payloadBufferReader
          .readReverse(constants.PUBKEY_ID_SIZE)
          .toString('hex'),
      });
    }
    // one join signature per share
    payload.joinSigs = [];
    for (var j = 0; j < sharesCount; j++) {
      payload.joinSigs.push(
        payloadBufferReader.read(COMPACT_SIGNATURE_SIZE).toString('hex')
      );
    }
    payload.earlyPeriodBlocks = payloadBufferReader.readUInt32LE();
    payload.earlyPenalty = payloadBufferReader.readUInt64LEBN().toNumber();
  } else {
    var scriptPayoutSize = payloadBufferReader.readVarintNum();
    payload.scriptPayout = payloadBufferReader
      .read(scriptPayoutSize)
      .toString('hex');
  }
  payload.inputsHash = payloadBufferReader
    .readReverse(constants.SHA256_HASH_SIZE)
    .toString('hex');

  if (payload.version >= 2 && payload.type === MASTERNODE_TYPE_HP) {
    payload.platformNodeID = payloadBufferReader.readReverse(PLATFORM_NODE_ID_SIZE).toString('hex');
    // ExtAddr evonodes keep the platform ports in their addresses
    if (payload.version < PROTX_EXT_ADDR_VERSION) {
      payload.platformP2PPort = payloadBufferReader.readUInt16LE();
      payload.platformHTTPPort = payloadBufferReader.readUInt16LE();
    }
  }

  payload.payloadSigSize = payloadBufferReader.readVarintNum();
  if (payload.payloadSigSize > 0) {
    payload.payloadSig = payloadBufferReader
      .read(payload.payloadSigSize)
      .toString('hex');
  }
  if (!payloadBufferReader.finished()) {
    throw new Error(
      'Failed to parse payload: raw payload is bigger than expected.'
    );
  }

  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|ProRegTxPayloadJSON} payloadJson
 * @return {ProRegTxPayload}
 */
ProRegTxPayload.fromJSON = function fromJSON(payloadJson) {
  var payload = new ProRegTxPayload(payloadJson);
  payload.validate();
  return payload;
};

/* Instance methods */

/**
 * Validate payload
 * @return {boolean}
 */
ProRegTxPayload.prototype.validate = function () {
  Preconditions.checkArgument(
    utils.isUnsignedInteger(this.version),
    'Expect version to be an unsigned integer'
  );
  Preconditions.checkArgumentType(
    this.collateralIndex,
    'number',
    'collateralIndex'
  );
  Preconditions.checkArgument(
    utils.isSha256HexString(this.collateralHash),
    'Expect collateralHash to be a hex string representing sha256 hash'
  );
  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    netInfo.extNetInfoToBuffer(this.addresses);
  } else if (!ipUtil.isZeroAddress(this.service)) {
    Preconditions.checkArgument(
      ipUtil.isIPV4(this.service),
      'Expected service to be a string with ip address and port'
    );
  }
  Preconditions.checkArgument(
    utils.isHexaString(this.keyIDOwner),
    'Expect keyIDOwner to be a hex string'
  );
  Preconditions.checkArgument(
    utils.isHexaString(this.pubKeyOperator),
    'Expect pubKeyOperator to be a hex string'
  );
  Preconditions.checkArgument(
    utils.isHexaString(this.keyIDVoting),
    'Expect keyIDVoting to be a hex string'
  );
  Preconditions.checkArgument(
    this.keyIDOwner.length === constants.PUBKEY_ID_SIZE * 2,
    'Expect keyIDOwner to be 20 bytes in size '
  );
  Preconditions.checkArgument(
    this.pubKeyOperator.length === constants.BLS_PUBLIC_KEY_SIZE * 2,
    'Expect keyIDOwner to be 48 bytes in size '
  );
  Preconditions.checkArgument(
    this.keyIDVoting.length === constants.PUBKEY_ID_SIZE * 2,
    'Expect keyIDOwner to be 20 bytes in size '
  );
  Preconditions.checkArgumentType(
    this.operatorReward,
    'number',
    'operatorReward'
  );
  Preconditions.checkArgument(
    this.operatorReward <= 10000,
    'Expect operatorReward to be lesser than or equal 10000'
  );
  Preconditions.checkArgument(
    utils.isHexaString(this.inputsHash),
    'Expect inputsHash to be a hex string'
  );

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    Preconditions.checkArgument(
      utils.isHexaString(this.platformNodeID),
      'Expect platformNodeID to be a hex string'
    );

    if (this.version < PROTX_EXT_ADDR_VERSION) {
      Preconditions.checkArgument(
        utils.isUnsignedInteger(this.platformP2PPort),
        'Expect platformP2PPort to be an integer'
      );

      Preconditions.checkArgument(
        utils.isUnsignedInteger(this.platformHTTPPort),
        'Expect platformHTTPPort to be an integer'
      );
    }
  }

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payouts.validatePayouts(this.payouts);
    validateShares(this);
    // Core pays a shared masternode's owner rewards by share and any other
    // masternode's to its payouts (CProRegTx::IsTriviallyValid)
    if (this.shares.length > 0) {
      Preconditions.checkArgument(
        this.payouts.length === 0,
        'Expect no payouts for a shared masternode'
      );
    } else {
      Preconditions.checkArgument(
        this.payouts.length > 0,
        'Expect at least one payout'
      );
    }
  }

  if (this.scriptPayout) {
    var script = new Script(this.scriptPayout);
    Preconditions.checkArgument(
      script.isPublicKeyHashOut() || script.isScriptHashOut(),
      'Expected scriptOperatorPayout to be a p2pkh/p2sh'
    );
  }

  if (Boolean(this.payloadSig)) {
    Preconditions.checkArgumentType(
      this.payloadSigSize,
      'number',
      'payloadSigSize'
    );
    Preconditions.checkArgument(
      utils.isUnsignedInteger(this.payloadSigSize),
      'Expect payloadSigSize to be an unsigned integer'
    );
    Preconditions.checkArgument(
      utils.isHexaString(this.payloadSig),
      'Expect payload sig to be a hex string'
    );
  }
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param [options.skipSignature]
 * @param [options.network] - network for address serialization
 * @return {ProRegTxPayloadJSON}
 */
ProRegTxPayload.prototype.toJSON = function toJSON(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  var network = options && options.network;
  this.validate();
  var isExtAddr = this.version >= PROTX_EXT_ADDR_VERSION;
  var payloadJSON = {
    version: this.version,
  };

  // fromJSON reads a missing type as regular, so older versions only report it
  // for evonodes and keep their regular masternode JSON as it was
  if (isExtAddr || this.type !== MASTERNODE_TYPE_BASIC) {
    payloadJSON.type = this.type;
  }

  payloadJSON.collateralHash = this.collateralHash;
  payloadJSON.collateralIndex = this.collateralIndex;
  if (isExtAddr) {
    payloadJSON.addresses = _.cloneDeep(this.addresses);
  } else {
    payloadJSON.service = this.service;
  }
  payloadJSON.keyIDOwner = this.keyIDOwner;
  payloadJSON.pubKeyOperator = this.pubKeyOperator;
  payloadJSON.keyIDVoting = this.keyIDVoting;
  payloadJSON.operatorReward = this.operatorReward;
  if (isExtAddr) {
    payloadJSON.payouts = payouts.payoutsToJSON(this.payouts, network);
    payloadJSON.shares = sharesToJSON(this.shares, network);
    payloadJSON.joinSigs = this.joinSigs.slice();
    payloadJSON.earlyPeriodBlocks = this.earlyPeriodBlocks;
    payloadJSON.earlyPenalty = this.earlyPenalty;
  } else {
    payloadJSON.payoutAddress = new Script(this.scriptPayout)
      .toAddress(network)
      .toString();
  }
  payloadJSON.inputsHash = this.inputsHash;

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    payloadJSON.platformNodeID = this.platformNodeID;
    if (this.version < PROTX_EXT_ADDR_VERSION) {
      payloadJSON.platformP2PPort = this.platformP2PPort;
      payloadJSON.platformHTTPPort = this.platformHTTPPort;
    }
  }

  if (!skipSignature) {
    payloadJSON.payloadSigSize = this.payloadSigSize;
    payloadJSON.payloadSig = this.payloadSig;
  }
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {Boolean} [options.skipSignature] - skip signature. Needed for signing
 * @return {Buffer}
 */
ProRegTxPayload.prototype.toBuffer = function toBuffer(options) {
  var noSignature = !Boolean(this.payloadSig);
  var skipSignature = noSignature || (options && options.skipSignature);
  this.validate();

  var payloadBufferWriter = new BufferWriter();

  payloadBufferWriter
    .writeUInt16LE(this.version)
    .writeUInt16LE(this.type)
    .writeUInt16LE(this.mode)
    .write(Buffer.from(this.collateralHash, 'hex').reverse())
    .writeInt32LE(this.collateralIndex);

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payloadBufferWriter.write(netInfo.extNetInfoToBuffer(this.addresses));
  } else {
    payloadBufferWriter.write(ipUtil.ipAndPortToBuffer(this.service));
  }

  payloadBufferWriter
    .write(Buffer.from(this.keyIDOwner, 'hex').reverse())
    .write(Buffer.from(this.pubKeyOperator, 'hex'))
    .write(Buffer.from(this.keyIDVoting, 'hex').reverse())
    .writeUInt16LE(this.operatorReward);

  if (this.version >= PROTX_EXT_ADDR_VERSION) {
    payouts.writePayouts(payloadBufferWriter, this.payouts);
    payloadBufferWriter.writeUInt8(this.shares.length);
    this.shares.forEach(function (share) {
      var scriptRefund = Buffer.from(share.scriptRefund, 'hex');
      var scriptReward = Buffer.from(share.scriptReward, 'hex');
      payloadBufferWriter
        .writeUInt64LEBN(new BN(share.amount))
        .writeVarintNum(scriptRefund.length)
        .write(scriptRefund)
        .writeVarintNum(scriptReward.length)
        .write(scriptReward)
        .write(Buffer.from(share.keyIDOwner, 'hex').reverse());
    });
    this.joinSigs.forEach(function (joinSig) {
      payloadBufferWriter.write(Buffer.from(joinSig, 'hex'));
    });
    payloadBufferWriter
      .writeUInt32LE(this.earlyPeriodBlocks)
      .writeUInt64LEBN(new BN(this.earlyPenalty));
  } else {
    payloadBufferWriter
      .writeVarintNum(Buffer.from(this.scriptPayout, 'hex').length)
      .write(Buffer.from(this.scriptPayout, 'hex'));
  }

  payloadBufferWriter.write(Buffer.from(this.inputsHash, 'hex').reverse());

  if (this.version >= 2 && this.type === MASTERNODE_TYPE_HP) {
    payloadBufferWriter.write(Buffer.from(this.platformNodeID, 'hex').reverse());
    if (this.version < PROTX_EXT_ADDR_VERSION) {
      payloadBufferWriter
        .writeUInt16LE(this.platformP2PPort)
        .writeUInt16LE(this.platformHTTPPort);
    }
  }

  if (!skipSignature && this.payloadSig) {
    payloadBufferWriter.writeVarintNum(
      Buffer.from(this.payloadSig, 'hex').length
    );
    payloadBufferWriter.write(Buffer.from(this.payloadSig, 'hex'));
  } else {
    payloadBufferWriter.writeVarintNum(constants.EMPTY_SIGNATURE_SIZE);
  }

  return payloadBufferWriter.toBuffer();
};

ProRegTxPayload.prototype.copy = function copy() {
  return ProRegTxPayload.fromBuffer(this.toBuffer());
};

module.exports = ProRegTxPayload;
