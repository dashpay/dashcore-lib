import { Block } from "../block/Block";
import { ChainLock } from "../chainlock/ChainLock";

export class ChainLockSigMessage {
  /**
   * Parses raw buffer from rawchainlocksig zmq message
   * @param {Buffer} chainLockSigMessageBuffer - contents of rawchainlocksig zmq message
   */
  constructor(chainLockSigMessageBuffer: Buffer);

  readonly block: Block;
  readonly chainLock: ChainLock;
}
