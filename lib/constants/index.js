module.exports = {
  // Public key id size in bytes
  PUBKEY_ID_SIZE: 20,
  // Standard compact size variable, size in bytes
  COMPACT_SIGNATURE_SIZE: 65,
  // SHA256 hash size in bytes
  SHA256_HASH_SIZE: 32,
  // Quorum BLS Public Key size in bytes
  BLS_PUBLIC_KEY_SIZE: 48,
  // BLS Signature size in bytes
  BLS_SIGNATURE_SIZE: 96,
  registeredTransactionTypes: {
    TRANSACTION_NORMAL: 0,
    TRANSACTION_PROVIDER_REGISTER: 1,
    TRANSACTION_PROVIDER_UPDATE_SERVICE: 2,
    TRANSACTION_PROVIDER_UPDATE_REGISTRAR: 3,
    TRANSACTION_PROVIDER_UPDATE_REVOKE: 4,
    TRANSACTION_COINBASE: 5,
    TRANSACTION_QUORUM_COMMITMENT: 6,
    TRANSACTION_SUBTX_REGISTER: 8,
    TRANSACTION_SUBTX_TOPUP: 9,
    TRANSACTION_SUBTX_RESETKEY: 10,
    TRANSACTION_SUBTX_CLOSEACCOUNT: 11,
    TRANSACTION_SUBTX_TRANSITION: 12,
  },
  EMPTY_SIGNATURE_SIZE: 0,
  primitives: {
    BOOLEAN: 1,
  },
  ipAddresses: {
    IPV4MAPPEDHOST: 16,
    PORT: 2,
  },
  IP_ADDRESS_SIZE: 16,
  EMPTY_IPV6_ADDRESS: '[0:0:0:0:0:0:0:0]:0',
  EMPTY_IPV4_ADDRESS: '0.0.0.0:0',
  CURRENT_PROTOCOL_VERSION: 70211,
  SML_ENTRY_SIZE: 151,
  NULL_HASH: '0000000000000000000000000000000000000000000000000000000000000000',
  // In duffs
  INSTANTSEND_FEE_PER_INPUT: 10000,
  LLMQ_TYPES: {
    LLMQ_TYPE_50_60: 1,
    // 50 members, 30 (60%) threshold, one per hour (24 blocks)
    LLMQ_TYPE_400_60: 2,
    // 400 members, 240 (60%) threshold, one every 12 hours (288 blocks)
    LLMQ_TYPE_400_85: 3,
    // 400 members, 340 (85%) threshold, one every 24 hours (576 blocks)
    LLMQ_TYPE_LLMQ_TEST: 100,
    // 3 members, 2 (66%) threshold, one per hour (24 blocks)
    // Params might differ when -llmqtestparams is used
    LLMQ_TYPE_LLMQ_DEVNET: 101,
    // 10 members, 6 (60%) threshold, one per hour (24 blocks)
    // Params might differ when -llmqdevnetparams is used
  },
  SMLSTORE_MAX_DIFFS: 720, // keep diffs for 30 hours (720 blocks)
};
