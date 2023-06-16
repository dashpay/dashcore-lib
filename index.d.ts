import { PrivateKey } from './typings/PrivateKey';
import { PublicKey } from './typings/PublicKey';
import { BN } from './typings/crypto/BN';
import { Point } from './typings/crypto/Point';
import { Signature } from './typings/crypto/Signature';
import { Hash } from './typings/crypto/Hash';
import { Script } from './typings/script/Script';
import { AbstractPayload } from './typings/transaction/payload/AbstractPayload';
import { Transaction } from './typings/transaction/Transaction';
import { ChainLockSigMessage } from './typings/zmqMessages/ChainLockSigMessage';

export { Address } from './typings/Address';
export { bitcore } from './typings/bitcore';
export { BloomFilter } from './typings/BloomFilter';
export { HDPrivateKey } from './typings/HDPrivateKey';
export { HDPublicKey } from './typings/HDPublicKey';
export { Message } from './typings/Message';
export { Network } from './typings/Network';
export { Opcode } from './typings/Opcode';
export { PrivateKey };

export { PublicKey };
export { Unit } from './typings/Unit';
export { URI } from './typings/URI';
export { InstantLock } from './typings/instantlock/instantlock';

export { Block } from './typings/block/Block';
export { BlockHeader } from './typings/block/BlockHeader';
export { MerkleBlock } from './typings/block/MerkleBlock';
export { PartialMerkleTree } from './typings/block/PartialMerkleTree';

export { BufferWriter } from './typings/buffer/BufferWriter';
export { BufferReader } from './typings/buffer/BufferReader';

export { ChainLock } from './typings/chainlock/ChainLock';

export { BN };
export { Point };
export { Signature };
export { Hash };

export { QuorumEntry } from './typings/deterministicmnlist/QuorumEntry';
export { SimplifiedMNList } from './typings/deterministicmnlist/SimplifiedMNList';
export { SimplifiedMNListDiff } from './typings/deterministicmnlist/SimplifiedMNListDiff';
export { SimplifiedMNListEntry } from './typings/deterministicmnlist/SimplifiedMNListEntry';
export { SimplifiedMNListStore } from './typings/deterministicmnlist/SimplifiedMNListStore';

export { GovObject } from './typings/govobject/GovObject';
export { Proposal } from './typings/govobject/Proposal';
export { Trigger } from './typings/govobject/Trigger';

export { Mnemonic } from './typings/mnemonic/Mnemonic';

export { Script };

export { Input } from './typings/transaction/input/Input';
export { MultiSigInput } from './typings/transaction/input/MultiSigInput';
export { MultiSigScriptHashInput } from './typings/transaction/input/MultiSigScriptHashInput';

export { AbstractPayload };
export { CoinbasePayload } from './typings/transaction/payload/CoinbasePayload';
export { CommitmentTxPayload } from './typings/transaction/payload/CommitmentTxPayload';
export { ProRegTxPayload } from './typings/transaction/payload/ProRegTxPayload';
export { ProUpRegTxPayload } from './typings/transaction/payload/ProUpRegTxPayload';
export { ProUpRevTxPayload } from './typings/transaction/payload/ProUpRevTxPayload';
export { ProUpServTxPayload } from './typings/transaction/payload/ProUpServTxPayload';

export { Output } from './typings/transaction/Output';

export { Transaction };
export { TransactionSignature } from './typings/transaction/TransactionSignature';
export { UnspentOutput } from './typings/transaction/UnspentOutput';
export { ChainLockSigMessage };

  /**
   * PDKBF2
   * Credit to: https://github.com/stayradiated/pbkdf2-sha512
   * Copyright (c) 2014, JP Richardson Copyright (c) 2010-2011 Intalio Pte, All Rights Reserved
   */
export function pbkdf2(): void;

/**
 * Bitcoin transactions contain scripts. Each input has a script called the
 * scriptSig, and each output has a script called the scriptPubkey. To validate
 * an input, the input's script is concatenated with the referenced output script,
 * and the result is executed. If at the end of execution the stack contains a
 * "true" value, then the transaction is valid.
 *
 * The primary way to use this class is via the verify function.
 * e.g., Interpreter().verify( ... );
 */
export function Interpreter(): void;

/**
 *
 * @param {number} payloadType
 * @return {AbstractPayload}
 */
export function getPayloadClass(payloadType: number): AbstractPayload;

/**
 * Parses payload and returns instance of payload to work with
 * @param {number} payloadType
 * @param {Buffer} rawPayload
 * @return {AbstractPayload}
 */
export function parsePayloadBuffer(
  payloadType: number,
  rawPayload: Buffer
): AbstractPayload;

/**
 * @param {Number} payloadType
 * @param {Object} payloadJson
 * @return {AbstractPayload}
 */
export function parsePayloadJSON(
  payloadType: number,
  payloadJson: any
): AbstractPayload;

/**
 * Create an empty instance of payload class
 * @param payloadType
 * @return {AbstractPayload}
 */
export function createPayload(payloadType: any): AbstractPayload;

/**
 * Checks if type matches payload
 * @param {number} payloadType
 * @param {AbstractPayload} payload
 * @return {boolean}
 */
export function isPayloadMatchesType(
  payloadType: number,
  payload: AbstractPayload
): boolean;

/**
 * Serializes payload
 * @param {AbstractPayload} payload
 * @return {Buffer}
 */
export function serializePayloadToBuffer(payload: AbstractPayload): Buffer;

/**
 * Serializes payload to JSON
 * @param payload
 * @return {Object}
 */
export function serializePayloadToJSON(payload: any): any;

/**
 * @namespace Signing
 */
export namespace Signing {
  /**
   * @function
   * Returns a buffer of length 32 bytes with the hash that needs to be signed
   * for OP_CHECKSIG.
   *
   * @name Signing.sighash
   * @param {Transaction} transaction the transaction to sign
   * @param {number} sighashType the type of the hash
   * @param {number} inputNumber the input index for the signature
   * @param {Script} subscript the script that will be signed
   */
  function sighash(
    transaction: Transaction,
    sighashType: number,
    inputNumber: number,
    subscript: Script
  ): void;

  /**
   * Create a signature
   *
   * @function
   * @name Signing.sign
   * @param {Transaction} transaction
   * @param {PrivateKey} privateKey
   * @param {number} sighash
   * @param {number} inputIndex
   * @param {Script} subscript
   * @return {Signature}
   */
  function sign(
    transaction: Transaction,
    privateKey: PrivateKey,
    sighash: number,
    inputIndex: number,
    subscript: Script
  ): Signature;

  /**
   * Verify a signature
   *
   * @function
   * @name Signing.verify
   * @param {Transaction} transaction
   * @param {Signature} signature
   * @param {PublicKey} publicKey
   * @param {number} inputIndex
   * @param {Script} subscript
   * @return {boolean}
   */
  function verify(
    transaction: Transaction,
    signature: Signature,
    publicKey: PublicKey,
    inputIndex: number,
    subscript: Script
  ): boolean;
}

/**
 * @desc
 * Wrapper around Signature with fields related to signing a transaction specifically
 *
 * @param {Object|string|TransactionSignature} arg
 * @constructor
 */

/**
 * @param {string} bitString
 * @return {boolean}
 */
export function isBitString(bitString: string): boolean;

/**
 * Converts boolean array to uint8 array, i.e:
 * [true, true, true, true, true, true, true, true] will be converted to [255]
 * @param {boolean[]|number[]} bitArray
 * @param {boolean} [reverseBits]
 * @return {number[]}
 */
export function convertBitArrayToUInt8Array(
  bitArray: boolean[] | number[],
  reverseBits?: boolean
): number[];

/**
 * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
 * @param {string} bitString
 * @param {boolean} reverseBits
 * @return {number[]}
 */
export function bitStringToUInt8Array(
  bitString: string,
  reverseBits: boolean
): number[];

/**
 * Maps ipv4:port to ipv6 buffer and port
 * Note: this is made mostly for the deterministic masternode list, which are ipv4 addresses encoded as ipv6 addresses
 * @param {string} string
 * @return {Buffer}
 */
export function ipAndPortToBuffer(string: string): Buffer;

/**
 * Parses ipv6 buffer and port to ipv4:port string
 * @param {Buffer} buffer
 * @return {string}
 */
export function bufferToIPAndPort(buffer: Buffer): string;

/**
 * Checks if string is an ipv4 address
 * @param {string} ipAndPortString
 * @return {boolean}
 */
export function isIpV4(ipAndPortString: string): boolean;

/**
 * @param {string} address
 * @return {boolean}
 */
export function isZeroAddress(address: string): boolean;

/**
 * @namespace JSUtil
 */
export namespace JSUtil {
  /**
   * Determines whether a string contains only hexadecimal values
   *
   * @function
   * @name JSUtil.isHexa
   * @param {string} value
   * @return {boolean} true if the string is the hex representation of a number
   */
  function isHexa(value: string): boolean;
}

export namespace crypto {
  export { BN };
  export { Point };
  export { Signature }
  export { Hash }
}

export namespace ZmqMessages {
  export { ChainLockSigMessage };
}

/**
 * Builds a merkle tree of all passed hashes
 * @link https://en.bitcoin.it/wiki/Protocol_specification#Merkle_Trees
 * @param {Buffer[]} hashes
 * @returns {Buffer[]} - An array with each level of the tree after the other.
 */
export function getMerkleTree(hashes: Buffer[]): Buffer[];

/**
 * Copies root of the passed tree to a new Buffer and returns it
 * @param {Buffer[]} merkleTree
 * @returns {Buffer|undefined} - A buffer of the merkle root hash
 */
export function getMerkleRoot(merkleTree: Buffer[]): Buffer | undefined;

/**
 * Helper function to efficiently calculate the number of nodes at given height in the merkle tree
 * @param {number} totalElementsCount
 * @param {number} height
 * @return {number}
 */
export function calculateTreeWidth(
  totalElementsCount: number,
  height: number
): number;

/**
 * @param {number} hashesCount
 * @return {number}
 */
export function calculateTreeHeight(hashesCount: number): number;

/**
 *
 * @param {number} height
 * @param {number} position
 * @param {Buffer[]} hashes
 * @return {Buffer}
 */
export function calculateHashAtHeight(
  height: number,
  position: number,
  hashes: Buffer[]
): Buffer;

/**
 * @param {number} height
 * @param {number} position
 * @param {Buffer[]} hashes
 * @param {boolean[]} matches
 * @return {{flags: boolean[], merkleHashes: string[]}}
 */
export function traverseAndBuildPartialTree(
  height: number,
  position: number,
  hashes: Buffer[],
  matches: boolean[]
): any;