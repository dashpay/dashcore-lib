import { expectType } from 'tsd';

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

// Shared masternode payloads (Core V24)

declare const transaction: Transaction;
declare const proDisTxPayload: ProDisTxPayload;
declare const proUpShareTxPayload: ProUpShareTxPayload;
declare const proUpSharedRegTxPayload: ProUpSharedRegTxPayload;

expectType<string[]>(proDisTxPayload.payloadSigs);
expectType<Buffer>(proDisTxPayload.getSignHash(transaction, 1));
expectType<ProDisTxPayload>(proDisTxPayload.sign('key', transaction, 1));
expectType<boolean>(proDisTxPayload.verifySignature('id', transaction, 0));
expectType<string>(proUpShareTxPayload.toJSON({ network: 'testnet' }).rewardAddress);
expectType<string>(proUpShareTxPayload.scriptReward);
expectType<ProUpSharedRegTxPayload>(proUpSharedRegTxPayload.sign('key'));
expectType<boolean>(proUpSharedRegTxPayload.verifySignature('id', 1));
