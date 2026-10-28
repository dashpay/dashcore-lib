const Preconditions = require('../../util/preconditions');
const utils = require('../../util/js');
const Script = require('../../script');

// Owner payout list of version 3 (ExtAddr) ProRegTx and ProUpRegTx payloads,
// Core's MasternodePayoutShares (src/evo/providertx.h)

// MasternodePayoutShare::MAX_REWARD, the reward of a single payee
const MAX_REWARD = 10000;
// Core writes the payout count as one byte
const MAX_PAYOUTS_COUNT = 0xff;

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
 * @param {MasternodePayout[]} payouts
 */
function validatePayouts(payouts) {
  Preconditions.checkArgument(
    Array.isArray(payouts) && payouts.length <= MAX_PAYOUTS_COUNT,
    'Expect payouts to be an array of at most 255 payouts',
  );
  payouts.forEach((payout) => {
    Preconditions.checkArgument(
      utils.isHexaString(payout.scriptPayout),
      'Expect payout scriptPayout to be a hex string',
    );
    const script = new Script(payout.scriptPayout);
    Preconditions.checkArgument(
      script.isPublicKeyHashOut() || script.isScriptHashOut(),
      'Expected payout scriptPayout to be a p2pkh/p2sh',
    );
    Preconditions.checkArgument(
      utils.isUnsignedInteger(payout.reward) && payout.reward <= MAX_REWARD,
      'Expect payout reward to be an integer from 0 to 10000',
    );
  });
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

module.exports = {
  readPayouts,
  writePayouts,
  validatePayouts,
  payoutsToJSON,
  payoutsFromJSON,
};
