// Ensure exports of basic types
import type {
  Address,
  BloomFilter,
  HDPrivateKey,
  HDPublicKey,
  Message,
  Network,
  Opcode,
  PrivateKey,
  PublicKey,
  Unit,
  URI,
  InstantLock,
  Block,
  BlockHeader,
  MerkleBlock,
  PartialMerkleTree,
  BufferWriter,
  BufferReader,
  ChainLock,
  BN,
  Point,
  Signature,
  Hash,
  QuorumEntry,
  SimplifiedMNList,
  SimplifiedMNListDiff,
  SimplifiedMNListEntry,
  SimplifiedMNListStore,
  GovObject,
  Proposal,
  Trigger,
  Mnemonic,
  Script,
  Input,
  MultiSigInput,
  MultiSigScriptHashInput,
  AbstractPayload,
  AssetLockPayload,
  AssetUnlockPayload,
  CoinbasePayload,
  CommitmentTxPayload,
  MnHfSignalPayload,
  ProRegTxPayload,
  ProUpRegTxPayload,
  ProUpRevTxPayload,
  ProUpServTxPayload,
  ProDisTxPayload,
  ProUpShareTxPayload,
  ProUpSharedRegTxPayload,
  Output,
  Transaction,
  TransactionSignature,
  UnspentOutput,
  ChainLockSigMessage,
} from "..";

import { expectAssignable, expectType } from 'tsd';
import type {
  CollateralShare,
  CollateralShareJSON,
  MasternodeAddresses,
  MasternodePayout,
  MasternodePayoutJSON,
  ProRegTxPayloadJSON,
} from '..';

// Version 3 (ExtAddr) ProTx payloads
declare const proRegTxPayload: ProRegTxPayload;
expectType<MasternodeAddresses | undefined>(proRegTxPayload.addresses);
expectType<MasternodePayout[] | undefined>(proRegTxPayload.payouts);
expectType<CollateralShare[] | undefined>(proRegTxPayload.shares);
expectType<string[] | undefined>(proRegTxPayload.joinSigs);
expectType<number | undefined>(proRegTxPayload.earlyPeriodBlocks);
expectType<number | undefined>(proRegTxPayload.earlyPenalty);
expectType<string | undefined>(proRegTxPayload.service);

expectAssignable<ProRegTxPayloadJSON>({
  version: 3,
  type: 1,
  collateralHash: '00'.repeat(32),
  collateralIndex: 0,
  addresses: { core_p2p: ['1.2.3.4:9999'], platform_https: ['example.com:443'] },
  keyIDOwner: '00'.repeat(20),
  pubKeyOperator: '00'.repeat(48),
  keyIDVoting: '00'.repeat(20),
  operatorReward: 0,
  payouts: [{ address: 'yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7', reward: 10000 }],
  shares: [],
  joinSigs: [],
  earlyPeriodBlocks: 0,
  earlyPenalty: 0,
  inputsHash: '00'.repeat(32),
  platformNodeID: '00'.repeat(20),
});
expectAssignable<CollateralShareJSON>({
  amount: 50000000000,
  refundAddress: 'yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7',
  keyIDOwner: '00'.repeat(20),
});
expectAssignable<MasternodePayoutJSON>({ address: 'yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7', reward: 10000 });

declare const proUpServTxPayload: ProUpServTxPayload;
expectType<MasternodeAddresses | undefined>(proUpServTxPayload.addresses);
expectType<string | undefined>(proUpServTxPayload.service);
expectType<number | undefined>(proUpServTxPayload.type);
expectType<string | undefined>(proUpServTxPayload.platformNodeID);
expectType<number | undefined>(proUpServTxPayload.platformP2PPort);
expectType<number | undefined>(proUpServTxPayload.platformHTTPPort);

declare const proUpRegTxPayload: ProUpRegTxPayload;
expectType<MasternodePayout[] | undefined>(proUpRegTxPayload.payouts);
expectType<string | undefined>(proUpRegTxPayload.scriptPayout);
