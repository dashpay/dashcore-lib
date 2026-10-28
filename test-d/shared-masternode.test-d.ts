// Shared masternode payloads (Core V24)
import { expectType } from 'tsd';
import type {
  ProDisTxPayload,
  ProUpShareTxPayload,
  ProUpSharedRegTxPayload,
  Transaction,
} from '..';

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
expectType<ProUpShareTxPayload>(proUpShareTxPayload.sign('key'));
expectType<boolean>(proUpShareTxPayload.verifySignature('id'));
expectType<Buffer>(proUpShareTxPayload.getHash({ skipSignature: true }));
expectType<ProUpSharedRegTxPayload>(proUpSharedRegTxPayload.sign('key'));
expectType<boolean>(proUpSharedRegTxPayload.verifySignature('id', 1));
expectType<Buffer>(proUpSharedRegTxPayload.getHash({ skipSignature: true }));
