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
    // 50 members, 30 (60%) threshold, one per hour (24 blocks)
    LLMQ_TYPE_50_60: 1,

    // 400 members, 240 (60%) threshold, one every 12 hours (288 blocks)
    LLMQ_TYPE_400_60: 2,

    // 400 members, 340 (85%) threshold, one every 24 hours (576 blocks)
    LLMQ_TYPE_400_85: 3,

    // 100 members, 67 (67%) threshold, one every 24 hours (576 blocks)
    LLMQ_TYPE_100_67: 4,

    // 60 members, 45 (75%) threshold, one every 12 hours
    LLMQ_TYPE_60_75: 5,

    // 3 members, 2 (66%) threshold, one per hour (24 blocks)
    // Params might differ when -llmqtestparams is used
    LLMQ_TYPE_LLMQ_TEST: 100,

    // 12 members, 6 (60%) threshold, one per hour (24 blocks)
    // Params might differ when -llmqdevnetparams is used
    LLMQ_TYPE_LLMQ_DEVNET: 101,

    // 3 members, 2 (66%) threshold, one per hour.
    // Params might differ when -llmqtestparams is used
    LLMQ_TYPE_TEST_V17: 102,

    // 4 members, 2 (66%) threshold, one per hour.
    // Params might differ when -llmqtestparams is used
    LLMQ_TYPE_TEST_DIP0024: 103,

    // 3 members, 2 (66%) threshold, one per hour.
    // Params might differ when -llmqtestinstantsendparams is used
    LLMQ_TYPE_TEST_INSTANTSEND: 104,

    // 8 members, 4 (50%) threshold, one per hour.
    // Params might differ when -llmqdevnetparams is used
    // for devnets only. rotated version (v2) for devnets
    LLMQ_DEVNET_DIP0024: 105,
  },

  // when selecting a quorum for signing and verification, we use this offset as
  // starting height for scanning. This is because otherwise the resulting signatures
  // would not be verifiable by nodes which are not 100% at the chain tip.
  LLMQ_SIGN_HEIGHT_OFFSET: 8,

  // keep diffs for 30 hours (720 blocks)
  SMLSTORE_MAX_DIFFS: 720,

  HASH_QUORUM_INDEX_REQUIRED_VERSION: 2,
};
