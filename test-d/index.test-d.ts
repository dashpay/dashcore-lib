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
  Output,
  Transaction,
  TransactionSignature,
  UnspentOutput,
  ChainLockSigMessage,
} from "..";

import { expectType } from "tsd";

declare const transaction: Transaction;
expectType<string>(transaction.instanceHash);
expectType<Buffer>(transaction._getInstanceHash());
expectType<boolean>(transaction.isAssetUnlockWithStableTxid());

declare const block: Block;
expectType<Buffer>(block.getAssetUnlocksMerkleRoot());
