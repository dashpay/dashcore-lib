// Version 2 asset unlocks (Core V24)
import { expectType } from 'tsd';
import type { Block, Transaction } from '..';

declare const transaction: Transaction;
expectType<string>(transaction.instanceHash);
expectType<Buffer>(transaction._getInstanceHash());
expectType<boolean>(transaction.isAssetUnlockWithStableTxid());

declare const block: Block;
expectType<Buffer>(block.getAssetUnlocksMerkleRoot());
