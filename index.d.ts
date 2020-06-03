import * as _Address from './typings/Address';
import * as _bitcore from './typings/bitcore';
import * as _BloomFilter from './typings/BloomFilter';
import * as _HDPrivateKey from './typings/HDPrivateKey';
import * as _HDPublicKey from './typings/HDPublicKey';
import * as _Message from './typings/Message';
import * as _Network from './typings/Network';
import * as _Opcode from './typings/Opcode';
import * as _PrivateKey from './typings/PrivateKey';
import * as _PublicKey from './typings/PublicKey';
import * as _Unit from './typings/Unit';
import * as _URI from './typings/URI';

import * as _Block from './typings/block/Block';
import * as _BlockHeader from './typings/block/BlockHeader';
import * as _MerkleBlock from './typings/block/MerkleBlock';
import * as _PartialMerkleTree from './typings/block/PartialMerkleTree';

import * as _BufferWriter from './typings/buffer/BufferWriter';
import * as _BufferReader from './typings/buffer/BufferReader';

import * as _BN from './typings/crypto/BN';
import * as _Point from './typings/crypto/Point';
import * as _Signature from './typings/crypto/Signature';

import * as _SimplifiedMNListDiff from './typings/deterministicmnlist/SimplifiedMNListDiff';
import * as _SimplifiedMNListEntry from './typings/deterministicmnlist/SimplifiedMNListEntry';

import * as _GovObject from './typings/govobject/GovObject';
import * as _Proposal from './typings/govobject/Proposal';
import * as _Trigger from './typings/govobject/Trigger';

import * as _Mnemonic from './typings/mnemonic/Mnemonic';

import * as _Script from './typings/script/Script';

import * as _Input from './typings/transaction/input/Input';
import * as _MultiSigInput from './typings/transaction/input/MultiSigInput';
import * as _MultiSigScriptHashInput from './typings/transaction/input/MultiSigScriptHashInput';

import * as _AbstractPayload from './typings/transaction/payload/AbstractPayload';
import * as _CoinbasePayload from './typings/transaction/payload/CoinbasePayload';
import * as _CommitmentTxPayload from './typings/transaction/payload/CommitmentTxPayload';
import * as _ProRegTxPayload from './typings/transaction/payload/ProRegTxPayload';
import * as _ProUpRegTxPayload from './typings/transaction/payload/ProUpRegTxPayload';
import * as _ProUpRevTxPayload from './typings/transaction/payload/ProUpRevTxPayload';
import * as _ProUpServTxPayload from './typings/transaction/payload/ProUpServTxPayload';
import * as _SubTxCloseAccountPayload from './typings/transaction/payload/SubTxCloseAccountPayload';
import * as _SubTxRegisterPayload from './typings/transaction/payload/SubTxRegisterPayload';
import * as _SubTxResetKeyPayload from './typings/transaction/payload/SubTxResetKeyPayload';
import * as _SubTxTopupPayload from './typings/transaction/payload/SubTxTopupPayload';
import * as _SubTxTransitionPayload from './typings/transaction/payload/SubTxTransitionPayload';

import * as _Output from './typings/transaction/Output';
import * as _Transaction from './typings/transaction/Transaction';
import * as _TransactionSignature from './typings/transaction/TransactionSignature';
import * as _UnspentOutput from './typings/transaction/UnspentOutput';


declare module "@dashevo/dashcore-lib"  {
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
    export function parsePayloadBuffer(payloadType: number, rawPayload: Buffer): AbstractPayload;

    /**
     * @param {Number} payloadType
     * @param {Object} payloadJson
     * @return {AbstractPayload}
     */
    export function parsePayloadJSON(payloadType: number, payloadJson: any): AbstractPayload;

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
    export function isPayloadMatchesType(payloadType: number, payload: AbstractPayload): boolean;

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
        function sighash(transaction: Transaction, sighashType: number, inputNumber: number, subscript: Script): void;

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
        function sign(transaction: Transaction, privateKey: PrivateKey, sighash: number, inputIndex: number, subscript: Script): Signature;

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
        function verify(transaction: Transaction, signature: Signature, publicKey: PublicKey, inputIndex: number, subscript: Script): boolean;
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
    export function convertBitArrayToUInt8Array(bitArray: boolean[] | number[], reverseBits?: boolean): number[];

    /**
     * Converts a bit string, i.e. '1000101010101010100' to an array with 8 bit unsigned integers
     * @param {string} bitString
     * @param {boolean} reverseBits
     * @return {number[]}
     */
    export function bitStringToUInt8Array(bitString: string, reverseBits: boolean): number[];

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
    export function calculateTreeWidth(totalElementsCount: number, height: number): number;

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
    export function calculateHashAtHeight(height: number, position: number, hashes: Buffer[]): Buffer;

    /**
     * @param {number} height
     * @param {number} position
     * @param {Buffer[]} hashes
     * @param {boolean[]} matches
     * @return {{flags: boolean[], merkleHashes: string[]}}
     */
    export function traverseAndBuildPartialTree(height: number, position: number, hashes: Buffer[], matches: boolean[]): any;

    // @ts-ignore
    export import Address = _Address.Address;
    export import bitcore = _bitcore.bitcore;
    export import BloomFilter = _BloomFilter.BloomFilter;
    export import HDPrivateKey = _HDPrivateKey.HDPrivateKey;
    export import HDPublicKey = _HDPublicKey.HDPublicKey;
    export import Message = _Message.Message;
    export import Network = _Network.Network;
    export import Opcode = _Opcode.Opcode;
    export import PrivateKey = _PrivateKey.PrivateKey;
    export import PublicKey = _PublicKey.PublicKey;
    export import Unit = _Unit.Unit;
    export import URI = _URI.URI;

    export import Block = _Block.Block;
    export import BlockHeader = _BlockHeader.BlockHeader;
    export import MerkleBlock = _MerkleBlock.MerkleBlock;
    export import PartialMerkleTree = _PartialMerkleTree.PartialMerkleTree;

    export import BufferWriter = _BufferWriter.BufferWriter;
    export import BufferReader = _BufferReader.BufferReader;

    export import BN = _BN.BN;
    export import Point = _Point.Point;
    export import Signature = _Signature.Signature;

    export import SimplifiedMNListDiff = _SimplifiedMNListDiff.SimplifiedMNListDiff;
    export import SimplifiedMNListEntry = _SimplifiedMNListEntry.SimplifiedMNListEntry;

    export import GovObject = _GovObject.GovObject;
    export import Proposal = _Proposal.Proposal;
    export import Trigger = _Trigger.Trigger;

    export import Mnemonic = _Mnemonic.Mnemonic;

    export import Script = _Script.Script;

    export import Input = _Input.Input;
    export import MultiSigInput = _MultiSigInput.MultiSigInput;
    export import MultiSigScriptHashInput = _MultiSigScriptHashInput.MultiSigScriptHashInput;

    export import AbstractPayload = _AbstractPayload.AbstractPayload;
    export import CoinbasePayload = _CoinbasePayload.CoinbasePayload;
    export import CommitmentTxPayload = _CommitmentTxPayload.CommitmentTxPayload;
    export import ProRegTxPayload = _ProRegTxPayload.ProRegTxPayload;
    export import ProUpRegTxPayload = _ProUpRegTxPayload.ProUpRegTxPayload;
    export import ProUpRevTxPayload = _ProUpRevTxPayload.ProUpRevTxPayload;
    export import ProUpServTxPayload = _ProUpServTxPayload.ProUpServTxPayload;
    export import SubTxCloseAccountPayload = _SubTxCloseAccountPayload.SubTxCloseAccountPayload;
    export import SubTxRegisterPayload = _SubTxRegisterPayload.SubTxRegisterPayload;
    export import SubTxResetKeyPayload = _SubTxResetKeyPayload.SubTxResetKeyPayload;
    export import SubTxTopupPayload = _SubTxTopupPayload.SubTxTopupPayload;
    export import SubTxTransitionPayload = _SubTxTransitionPayload.SubTxTransitionPayload;

    export import Output = _Output.Output;
    export import Transaction = _Transaction.Transaction;
    export import TransactionSignature = _TransactionSignature.TransactionSignature;
    export import UnspentOutput = _UnspentOutput.UnspentOutput;
}
