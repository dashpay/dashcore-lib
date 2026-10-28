/**
 * One owner payee of a version 3 (ExtAddr) ProRegTx or ProUpRegTx
 * @typedef {Object} MasternodePayout
 * @property {string} scriptPayout - payee script (p2pkh/p2sh)
 * @property {number} reward - share of the owner reward in basis points
 */
export type MasternodePayout = {
  scriptPayout: string;
  reward: number;
};

/**
 * @typedef {Object} MasternodePayoutJSON
 * @property {string} address - payee address
 * @property {number} reward - share of the owner reward in basis points
 */
export type MasternodePayoutJSON = {
  address: string;
  reward: number;
};

/**
 * "addr:port" lists by purpose (core_p2p, platform_p2p, platform_https),
 * as Core reports a masternode's ExtNetInfo
 */
export type MasternodeAddresses = {
  core_p2p?: string[];
  platform_p2p?: string[];
  platform_https?: string[];
};
