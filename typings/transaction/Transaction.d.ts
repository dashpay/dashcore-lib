import {Script} from "../script/Script";
import {Address} from "../Address";
import {Input} from "./input/Input";
import {PrivateKey} from "../PrivateKey";
import {PublicKey} from "../PublicKey";
import {Output} from "./Output";
import {Signature} from "../crypto/Signature";
import {AbstractPayload} from "./payload/AbstractPayload";
import {bitcore} from "../bitcore";

export namespace Transaction {
    /**
     * @typedef {Object} Transaction.fromObjectParams
     * @property {string} prevTxId
     * @property {number} outputIndex
     * @property {(Buffer|string|Script)} script
     * @property {number} satoshis
     */
    type fromObjectParams = {
        prevTxId: string;
        outputIndex: number;
        script: Buffer | string | Script;
        satoshis: number;
    };
    /**
     * @typedef {Object} Transaction.toObjectParams
     * @property {(string|Address)} address
     * @property {number} satoshis
     */
    type toObjectParams = {
        address: string | Address;
        satoshis: number;
    };
}
/**
 * Represents a transaction, a set of inputs and outputs to change ownership of tokens
 *
 * @param {*} serialized
 * @constructor
 */
export class Transaction {
    constructor(serialized: string | Buffer | Object | Transaction | undefined);

    version: number;
    id: string;
    hash: string;
    nLockTime: number;
    type: number;
    inputs: Input[];
    inputAmount: number;
    outputs: Output[];
    outputAmount: number;
    extraPayload?: AbstractPayload;

    /**
     * Create a 'shallow' copy of the transaction, by serializing and deserializing
     * it dropping any additional information that inputs and outputs may have hold
     *
     * @param {Transaction} transaction
     * @return {Transaction}
     */
    static shallowCopy(transaction: Transaction): Transaction;

    /**
     * Retrieve the little endian hash of the transaction (used for serialization)
     * @return {Buffer}
     */
    _getHash(): Buffer;

    /**
     * Retrieve a hex string that can be used with bitcoind's CLI interface
     * (decoderawtransaction, sendrawtransaction)
     *
     * @param {Object|boolean=} unsafe if true, skip all tests. if it's an object,
     *   it's expected to contain a set of flags to skip certain tests:
     * * `disableAll`: disable all checks
     * * `disableSmallFees`: disable checking for fees that are too small
     * * `disableLargeFees`: disable checking for fees that are too large
     * * `disableIsFullySigned`: disable checking if all inputs are fully signed
     * * `disableDustOutputs`: disable checking if there are no outputs that are dust amounts
     * * `disableMoreOutputThanInput`: disable checking if the transaction spends more bitcoins than the sum of the input amounts
     * @return {string}
     */
    serialize(unsafe: any | boolean): string;

    /**
     * Retrieve a hex string that can be used with bitcoind's CLI interface
     * (decoderawtransaction, sendrawtransaction)
     *
     * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
     * @return {string}
     */
    checkedSerialize(opts: any): string;

    /**
     * Retrieve a possible error that could appear when trying to serialize and
     * broadcast this transaction.
     *
     * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
     * @return {bitcore.Error}
     */
    getSerializationError(opts: any): bitcore.Error;

    /**
     * Instant send fee is based on the number of inputs, not on the transaction size
     * @return {number}
     */
    estimateInstantSendFee(): number;

    /**
     * Sets nLockTime so that transaction is not valid until the desired date(a
     * timestamp in seconds since UNIX epoch is also accepted)
     *
     * @param {Date | Number} time
     * @return {Transaction} this
     */
    lockUntilDate(time: Date | number): Transaction;

    /**
     * Sets nLockTime so that transaction is not valid until the desired block
     * height.
     *
     * @param {Number} height
     * @return {Transaction} this
     */
    lockUntilBlockHeight(height: number): Transaction;

    /**
     *  Returns a semantic version of the transaction's nLockTime.
     *  @return {Number|Date}
     *  If nLockTime is 0, it returns null,
     *  if it is < 500000000, it returns a block height (number)
     *  else it returns a Date object.
     */
    getLockTime(): number | Date;

    /**
     * Add an input to this transaction. This is a high level interface
     * to add an input, for more control, use @{link Transaction#addInput}.
     *
     * Can receive, as output information, the output of bitcoind's `listunspent` command,
     * and a slightly fancier format recognized by bitcore:
     *
     * ```
     * {
     *  address: 'mszYqVnqKoQx4jcTdJXxwKAissE3Jbrrc1',
     *  txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
     *  outputIndex: 0,
     *  script: Script.empty(),
     *  satoshis: 1020000
     * }
     * ```
     * Where `address` can be either a string or a bitcore Address object. The
     * same is true for `script`, which can be a string or a bitcore Script.
     *
     * Beware that this resets all the signatures for inputs (in further versions,
     * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
     *
     * @example
     * ```javascript
     * var transaction = new Transaction();
     *
     * // From a pay to public key hash output from bitcoind's listunspent
     * transaction.from({'txid': '0000...', vout: 0, amount: 0.1, scriptPubKey: 'OP_DUP ...'});
     *
     * // From a pay to public key hash output
     * transaction.from({'txId': '0000...', outputIndex: 0, satoshis: 1000, script: 'OP_DUP ...'});
     *
     * // From a multisig P2SH output
     * transaction.from({'txId': '0000...', inputIndex: 0, satoshis: 1000, script: '... OP_HASH'},
     *                  ['03000...', '02000...'], 2);
     * ```
     *
     * @param {(Array<Transaction.fromObjectParams>|Transaction.fromObjectParams)} utxo
     * @param {Array=} pubkeys
     * @param {number=} threshold
     */
    from(utxo: Transaction.fromObjectParams[] | Transaction.fromObjectParams, pubkeys?: any[], threshold?: number): void;

    /**
     * Add an input to this transaction. The input must be an instance of the `Input` class.
     * It should have information about the Output that it's spending, but if it's not already
     * set, two additional parameters, `outputScript` and `satoshis` can be provided.
     *
     * @param {Input} input
     * @param {String|Script} outputScript
     * @param {number} satoshis
     * @return Transaction {this}, for chaining
     */
    addInput(input: Input, outputScript: string | Script, satoshis: number): this;

    /**
     * Add an input to this transaction, without checking that the input has information about
     * the output that it's spending.
     *
     * @param {Input} input
     * @return Transaction {this}, for chaining
     */
    uncheckedAddInput(input: Input): this;

    /**
     * Returns true if the transaction has enough info on all inputs to be correctly validated
     *
     * @return {boolean}
     */
    hasAllUtxoInfo(): boolean;

    /**
     * Manually set the fee for this transaction. Beware that this resets all the signatures
     * for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not
     * be reset).
     *
     * @param {number} amount satoshis to be sent
     * @return {Transaction} this, for chaining
     */
    fee(amount: number): Transaction;

    /**
     * Manually set the fee per KB for this transaction. Beware that this resets all the signatures
     * for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not
     * be reset).
     *
     * @param {number} amount satoshis per KB to be sent
     * @return {Transaction} this, for chaining
     */
    feePerKb(amount: number): Transaction;

    /**
     * Set the change address for this transaction
     *
     * Beware that this resets all the signatures for inputs (in further versions,
     * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
     *
     * @param {Address} address An address for change to be sent to.
     * @return {Transaction} this, for chaining
     */
    change(address: Address): Transaction;

    /**
     * @return {Output} change output, if it exists
     */
    getChangeOutput(): Output;

    /**
     * Add an output to the transaction.
     *
     * Beware that this resets all the signatures for inputs (in further versions,
     * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
     *
     * @param {(string|Address|Array.<Transaction.toObjectParams>)} address
     * @param {number} amount in satoshis
     * @return {Transaction} this, for chaining
     */
    to(address: string | Address | Transaction.toObjectParams[], amount: number): Transaction;

    /**
     * Add an OP_RETURN output to the transaction.
     *
     * Beware that this resets all the signatures for inputs (in further versions,
     * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
     *
     * @param {Buffer|string} value the data to be stored in the OP_RETURN output.
     *    In case of a string, the UTF-8 representation will be stored
     * @return {Transaction} this, for chaining
     */
    addData(value: Buffer | string): Transaction;

    /**
     * Add an output to the transaction.
     *
     * @param {Output} output the output to add.
     * @return {Transaction} this, for chaining
     */
    addOutput(output: Output): Transaction;

    /**
     * Remove all outputs from the transaction.
     *
     * @return {Transaction} this, for chaining
     */
    clearOutputs(): Transaction;

    /**
     * Calculates or gets the total output amount in satoshis
     *
     * @return {Number} the transaction total output amount
     */
    _getOutputAmount(): number;

    /**
     * Calculates or gets the total input amount in satoshis
     *
     * @return {Number} the transaction total input amount
     */
    _getInputAmount(): number;

    /**
     * Calculates the fee of the transaction.
     *
     * If there's a fixed fee set, return that.
     *
     * If there is no change output set, the fee is the
     * total value of the outputs minus inputs. Note that
     * a serialized transaction only specifies the value
     * of its outputs. (The value of inputs are recorded
     * in the previous transaction outputs being spent.)
     * This method therefore raises a "MissingPreviousOutput"
     * error when called on a serialized transaction.
     *
     * If there's no fee set and no change address,
     * estimate the fee based on size.
     *
     * @return {Number} fee of this transaction in satoshis
     */
    getFee(): number;

    /**
     * Estimates fee from serialized transaction size in bytes.
     */
    _estimateFee(): void;

    /**
     * Sort a transaction's inputs and outputs according to BIP69
     *
     * @see {@link https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki}
     * @return {Transaction} this
     */
    sort(): Transaction;

    /**
     * Randomize this transaction's outputs ordering. The shuffling algorithm is a
     * version of the Fisher-Yates shuffle, provided by lodash's _.shuffle().
     *
     * @return {Transaction} this
     */
    shuffleOutputs(): Transaction;

    /**
     * Sort this transaction's outputs, according to a given sorting function that
     * takes an array as argument and returns a new array, with the same elements
     * but with a different order. The argument function MUST NOT modify the order
     * of the original array
     *
     * @param {Function} sortingFunction
     * @return {Transaction} this
     */
    sortOutputs(sortingFunction: (...params: any[]) => any): Transaction;

    /**
     * Sort this transaction's inputs, according to a given sorting function that
     * takes an array as argument and returns a new array, with the same elements
     * but with a different order.
     *
     * @param {Function} sortingFunction
     * @return {Transaction} this
     */
    sortInputs(sortingFunction: (...params: any[]) => any): Transaction;

    removeInput(txId, outputIndex): void;

    /**
     * Sign the transaction using one or more private keys.
     *
     * It tries to sign each input, verifying that the signature will be valid
     * (matches a public key).
     *
     * @param {Array|String|PrivateKey} privateKey
     * @param {number} [sigtype]
     * @return {Transaction} this, for chaining
     */
    sign(privateKey: any[] | string | PrivateKey, sigtype?: number): Transaction;

    getSignatures(): any[];
    canHaveNoUtxo(): boolean;

    /**
     * Add a signature to the transaction
     *
     * @param {Object} signature
     * @param {number} signature.inputIndex
     * @param {number} signature.sigtype
     * @param {PublicKey} signature.publicKey
     * @param {Signature} signature.signature
     * @return {Transaction} this, for chaining
     */
    applySignature(signature: {
        inputIndex: number;
        sigtype: number;
        publicKey: PublicKey;
        signature: Signature;
    }): Transaction;

    /**
     * Check whether the transaction is fully signed
     *
     * @return {boolean}
     */
    isFullySigned(): boolean;

    /**
     * Check whether the signature is valid
     *
     * @param signature
     * @return {Boolean}
     */
    isValidSignature(signature): boolean;

    /**
     * @returns {bool} whether the signature is valid for this transaction input
     */
    verifySignature(): boolean;

    /**
     * Check that a transaction passes basic sanity tests. If not, return a string
     * describing the error. This function contains the same logic as
     * CheckTransaction in bitcoin core.
     *
     * @return {Boolean|String} true or reason for failure as a string
     */
    verify(): Boolean|String;

    /**
     * Analogous to bitcoind's IsCoinBase function in transaction.h
     * @returns {boolean}
     */
    isCoinbase(): boolean;

    /**
     * Set special transaction type and create an empty extraPayload
     * @param {number} type
     * @returns {Transaction}
     */
    setType(type: number): Transaction;

    /**
     * Returns true if this transaction is DIP2 special transaction, returns false otherwise.
     * @returns {boolean}
     */
    isSpecialTransaction(): boolean;

    /**
     * Checks if transaction has DIP2 extra payload
     * @returns {boolean}
     */
    hasExtraPayload(): boolean;

    /**
     * @param {AbstractPayload} payload
     * @return {Transaction}
     */
    setExtraPayload(payload: AbstractPayload): Transaction;

    /**
     * Return extra payload size in bytes
     * @return {Number}
     */
    getExtraPayloadSize(): number;

    /**
     * @function
     * @returns {Object} A plain object with the address information
     */
    toObject(): any;

    /**
     * @function
     * @returns {Object} A plain object with the address information
     */
    toJSON(): any;

    /**
     * @param {Number} fundingAmount
     * @return {Transaction}
     */
    addFundingOutput(fundingAmount: Number ): Transaction;

    /**
     * @param {Number} satoshisToBurn
     * @param {Buffer} publicKeyHash
     * @return {Transaction}
     */
    addBurnOutput(satoshisToBurn: Number, publicKeyHash: Buffer): Transaction;

    /**
     * Gives an OutPoint buffer for the output at a given index
     *
     * @param {Number} outputIndex
     * @return {Buffer}
     */
    getOutPointBuffer(outputIndex: number): Buffer;
}
