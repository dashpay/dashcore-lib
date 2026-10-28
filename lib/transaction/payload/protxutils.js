const Preconditions = require('../../util/preconditions');
const utils = require('../../util/js');
const Script = require('../../script');
const { PROTX_EXT_ADDR_VERSION, PUBKEY_ID_SIZE } = require('../../constants');

// Helpers shared by the ProTx payloads: the owner payout list of version 3
// (ExtAddr) ProRegTx and ProUpRegTx payloads, Core's MasternodePayoutShares
// (src/evo/providertx.h), and JSON field checks

// MasternodePayoutShare::MIN_REWARD and MAX_REWARD, in basis points; the rewards
// of a payout list add up to MAX_REWARD
const MIN_REWARD = 100;
const MAX_REWARD = 10000;
// IsPayoutListTriviallyValid
const MAX_PAYOUTS_COUNT = 8;
// MainParams().GetDefaultPort(), which legacy platform ports may not use on any network
const MAINNET_DEFAULT_PORT = 9999;

/**
 * @typedef {Object} MasternodePayout
 * @property {string} scriptPayout - payee script (p2pkh/p2sh)
 * @property {number} reward - share of the owner reward in basis points
 */

/**
 * @typedef {Object} MasternodePayoutJSON
 * @property {string} address - payee address
 * @property {number} reward - share of the owner reward in basis points
 */

/**
 * @param {string} script - hex
 * @return {boolean} whether the script is p2pkh or p2sh
 */
function isPayoutScript(script) {
  if (!utils.isHexaString(script)) {
    return false;
  }
  const parsed = new Script(script);
  return parsed.isPublicKeyHashOut() || parsed.isScriptHashOut();
}

/**
 * Hex strings compare as the bytes they encode, whatever their letter case
 * @param {string} hex
 * @return {string}
 */
function bytesKey(hex) {
  return hex.toLowerCase();
}

/**
 * @param {string} hex
 * @return {boolean} whether all the bytes are zero
 */
function isNull(hex) {
  return /^0+$/.test(hex);
}

/**
 * Checks a 20 byte id (a key id or platformNodeID) Core requires to be non-null
 * @param {string} keyID
 * @param {string} name
 */
function validateKeyID(keyID, name) {
  Preconditions.checkArgument(
    utils.isHexStringOfSize(keyID, PUBKEY_ID_SIZE * 2) && !isNull(keyID),
    `Expect ${name} to be a non-null 20 byte key id`,
  );
}

/**
 * The context-free platform port checks of Core's CheckProviderNetworkFields
 * for a version 2 evonode; the mainnet-only port rules are left to Core
 * @param {number} p2pPort
 * @param {number} httpPort
 * @param {number} corePort - port of the service address, 0 if none
 */
function validateLegacyPlatformPorts(p2pPort, httpPort, corePort) {
  [p2pPort, httpPort].forEach((port) => {
    Preconditions.checkArgument(
      utils.isUnsignedInteger(port) && port <= 0xffff,
      'Expect platform ports to be 16-bit unsigned integers',
    );
    Preconditions.checkArgument(
      port !== MAINNET_DEFAULT_PORT,
      'Expect platform ports not to be the mainnet Core port 9999',
    );
  });
  Preconditions.checkArgument(
    p2pPort !== httpPort && p2pPort !== corePort && httpPort !== corePort,
    'Expect the platform ports and the Core port to differ',
  );
}

/**
 * @param {string} script - hex
 * @param {string} keyID - public key hash, in the byte order of the payload JSON
 * @return {boolean} whether the script is the P2PKH of the key
 */
function isP2PKHOf(script, keyID) {
  const parsed = new Script(script);
  return (
    parsed.isPublicKeyHashOut() &&
    parsed.chunks[2].buf.equals(Buffer.from(keyID, 'hex').reverse())
  );
}

/**
 * @param {BufferReader} reader
 * @return {MasternodePayout[]}
 */
function readPayouts(reader) {
  const payouts = [];
  const count = reader.readUInt8();
  for (let i = 0; i < count; i++) {
    const scriptPayoutSize = reader.readVarintNum();
    payouts.push({
      scriptPayout: reader.read(scriptPayoutSize).toString('hex'),
      reward: reader.readUInt16LE(),
    });
  }
  return payouts;
}

/**
 * @param {BufferWriter} writer
 * @param {MasternodePayout[]} payouts
 */
function writePayouts(writer, payouts) {
  writer.writeUInt8(payouts.length);
  payouts.forEach((payout) => {
    const scriptPayout = Buffer.from(payout.scriptPayout, 'hex');
    writer.writeVarintNum(scriptPayout.length);
    writer.write(scriptPayout);
    writer.writeUInt16LE(payout.reward);
  });
}

/**
 * The checks of Core's IsPayoutListTriviallyValid (src/evo/providertx.cpp)
 * @param {MasternodePayout[]} payouts
 * @param {string|null} keyIDOwner - owner key the payees must not pay, if any
 * @param {string} keyIDVoting - voting key the payees must not pay
 */
function validatePayouts(payouts, keyIDOwner, keyIDVoting) {
  Preconditions.checkArgument(
    Array.isArray(payouts) && payouts.length >= 1 && payouts.length <= MAX_PAYOUTS_COUNT,
    'Expect payouts to be an array of 1 to 8 payouts',
  );
  const seenScripts = new Set();
  let totalReward = 0;
  payouts.forEach((payout) => {
    Preconditions.checkArgument(
      utils.isUnsignedInteger(payout.reward) &&
        payout.reward >= MIN_REWARD &&
        payout.reward <= MAX_REWARD,
      'Expect payout reward to be an integer from 100 to 10000',
    );
    totalReward += payout.reward;
    Preconditions.checkArgument(
      isPayoutScript(payout.scriptPayout),
      'Expected payout scriptPayout to be a p2pkh/p2sh',
    );
    Preconditions.checkArgument(
      !seenScripts.has(bytesKey(payout.scriptPayout)),
      'Expect payout scripts to be unique',
    );
    seenScripts.add(bytesKey(payout.scriptPayout));
    Preconditions.checkArgument(
      !(keyIDOwner && isP2PKHOf(payout.scriptPayout, keyIDOwner)) &&
        !isP2PKHOf(payout.scriptPayout, keyIDVoting),
      'Expect payouts not to pay the owner or voting key',
    );
  });
  Preconditions.checkArgument(
    totalReward === MAX_REWARD,
    'Expect payout rewards to add up to 10000',
  );
}

/**
 * @param {MasternodePayout[]} payouts
 * @param {Network|string} [network] - network for address serialization
 * @return {MasternodePayoutJSON[]}
 */
function payoutsToJSON(payouts, network) {
  return payouts.map((payout) => ({
    address: new Script(payout.scriptPayout).toAddress(network).toString(),
    reward: payout.reward,
  }));
}

/**
 * @param {MasternodePayoutJSON[]} payoutsJSON
 * @return {MasternodePayout[]}
 */
function payoutsFromJSON(payoutsJSON) {
  Preconditions.checkArgument(Array.isArray(payoutsJSON), 'Expect payouts to be an array');
  return payoutsJSON.map((payout) => ({
    scriptPayout: Script.fromAddress(payout.address).toHex(),
    reward: payout.reward,
  }));
}

/**
 * Core rejects ProTx versions 0 and above ProTxVersion::ExtAddr (IsTriviallyValid)
 * @param {number} version
 */
function validateVersion(version) {
  Preconditions.checkArgument(
    utils.isUnsignedInteger(version) && version >= 1 && version <= PROTX_EXT_ADDR_VERSION,
    'Expect version to be an integer from 1 to 3',
  );
}

/**
 * Rejects JSON fields a payload of this version doesn't have, rather than
 * silently dropping them
 * @param {Object} payloadJSON
 * @param {string[]} fields
 * @param {number} version
 */
function checkNoFields(payloadJSON, fields, version) {
  fields.forEach((field) => {
    Preconditions.checkArgument(
      payloadJSON[field] === undefined,
      `Expect no ${field} in a version ${version} payload`,
    );
  });
}

module.exports = {
  bytesKey,
  isNull,
  validateKeyID,
  validateLegacyPlatformPorts,
  isPayoutScript,
  isP2PKHOf,
  checkNoFields,
  validateVersion,
  readPayouts,
  writePayouts,
  validatePayouts,
  payoutsToJSON,
  payoutsFromJSON,
};
