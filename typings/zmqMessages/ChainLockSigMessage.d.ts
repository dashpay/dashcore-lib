import { Block } from "../block/Block";
import { ChainLock } from "../chainlock/ChainLock";

export class ChainLockSigMessage {
  constructor(chainLockSigMessageBuffer: Buffer);

  readonly block: Block;
  readonly chainLock: ChainLock;
}
