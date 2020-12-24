const ChainLock = require('../chainlock/chainlock');
const Block = require('../block');

class ChainLockSigMessage {
  constructor(chainLockSigMessageBuffer) {
    this.block = new Block(chainLockSigMessageBuffer);

    const blockSize = this.block.toBuffer().length;
    const chainLockBuffer = chainLockSigMessageBuffer.slice(
      blockSize, chainLockSigMessageBuffer.length,
    );

    this.chainLock = new ChainLock(chainLockBuffer);
  }
}

module.exports = ChainLockSigMessage;
