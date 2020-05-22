import { Transaction } from "../Transaction";
import { PrivateKey } from "../../PrivateKey";

/**
 * @param params
 * @returns {Input|*}
 * @constructor
 */
export class Input {
    constructor(params: any);

    /**
     * Retrieve signatures for the provided PrivateKey.
     *
     * @param {Transaction} transaction - the transaction to be signed
     * @param {PrivateKey} privateKey - the private key to use when signing
     * @param {number} inputIndex - the index of this input in the provided transaction
     * @param {number} sigType - defaults to Signature.SIGHASH_ALL
     * @param {Buffer} addressHash - if provided, don't calculate the hash of the
     *     public key associated with the private key provided
     * @abstract
     */
    getSignatures(transaction: Transaction, privateKey: PrivateKey, inputIndex: number, sigType: number, addressHash: Buffer): void;

    /**
     * @returns true if this is a coinbase input (represents no input)
     */
    isNull(): any;
}
