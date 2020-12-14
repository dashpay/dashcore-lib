import {SimplifiedMNListDiff} from "./SimplifiedMNListDiff";
import {SimplifiedMNListEntry} from "./SimplifiedMNListEntry";
import {QuorumEntry} from "./QuorumEntry";

export class SimplifiedMNList {
    constructor(arg?: Buffer | any | string);

    /**
     *
     * @param {SimplifiedMNListDiff|Buffer|string|Object} simplifiedMNListDiff - MNList diff. Can be serialized or parsed
     * @return {void|Boolean}
     */
    applyDiff(simplifiedMNListDiff: SimplifiedMNListDiff|Buffer|string|Object): void|Boolean;

    /**
     * @private
     * Adds MNs to the MN list
     * @param {SimplifiedMNListEntry[]} mnListEntries
     */
    addOrUpdateMNs(mnListEntries: SimplifiedMNListEntry[]): void;
    /**
     * @private
     * Adds quorums to the quorum list
     * and maybe removes the oldest ones
     * if list has reached maximum entries for llmqType
     * @param {QuorumEntry[]} quorumEntries
     */
    addAndMaybeRemoveQuorums(quorumEntries: QuorumEntry[]): void;

    /**
     * @private
     * Deletes MNs from the MN list
     * @param {string[]} proRegTxHashes - list of proRegTxHashes to delete from MNList
     */
    deleteMNs(proRegTxHashes: string[]): void;

    /**
     * @private
     * Deletes quorums from the quorum list
     * @param {Array<obj>} deletedQuorums - deleted quorum objects
     */
    deleteQuorums(deletedQuorums: object[]): void;

    /**
     * Compares merkle root from the most recent diff applied matches the merkle root of the list
     * @returns {boolean}
     */
    verify(): boolean;

    /**
     * @private
     * Sorts MN List in deterministic order
     */
    sort(): void;

    /**
     * @private
     * @param {QuorumEntry[]} quorumList - sort array of quorum entries
     * Sorts the quorums deterministically
     */
    sortQuorums(quorumList: QuorumEntry[]): void;

    /**
     * Calculates merkle root of the MN list
     * @returns {string}
     */
    calculateMerkleRoot(): string;

    /**
     * Calculates merkle root of the quorum list
     * @returns {string}
     */
    calculateMerkleRootQuorums(): string;

    /**
     * Returns a list of valid masternodes
     * @returns {SimplifiedMNListEntry[]}
     */
    getValidMasternodesList(): SimplifiedMNListEntry[];

    /**
     * Returns a single quorum
     * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
     * @param {string} quorumHash - quorumHash of quorum
     * @returns {QuorumEntry}
     */
    getQuorum(llmqType: number, quorumHash: string): QuorumEntry;

    /**
     * Returns all quorums - verified or unverified
     * @returns {QuorumEntry[]}
     */
    getQuorums(): QuorumEntry[];

    /**
     * Returns only quorums of type llmqType - verified or unverified
     * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
     * @returns {QuorumEntry[]}
     */
    getQuorumsOfType(llmqType: number): QuorumEntry[];

    /**
     * Returns all already verified quorums
     * @returns {QuorumEntry[]}
     */
    getVerifiedQuorums(): QuorumEntry[];

    /**
     * Returns only already verified quorums of type llmqType
     * @param {constants.LLMQ_TYPES} llmqType - llmqType of quorum
     * @returns {QuorumEntry[]}
     */
    getVerifiedQuorumsOfType(llmqType: number): QuorumEntry[];

    /**
     * Returns all still unverified quorums
     * @returns {QuorumEntry[]}
     */
    getUnverifiedQuorums(): QuorumEntry[];


    /**
     * @return {number}
     */
    getLLMQTypes(): number;

    /**
     * @return {number}
     */
    getChainlockLLMQType(): number;

    /**
     * @return {number}
     */
    getValidatorLLMQType(): number;

    /**
     * @return {number}
     */
    getInstantSendLLMQType(): number;

    /**
     * Converts simplified MN list to simplified MN list diff that can be used to serialize data
     * to json, buffer, or a hex string
     * @param {string} [network]
     */
    toSimplifiedMNListDiff(): SimplifiedMNListDiff;

    /**
     * Deterministically selects all members of the quorum which
     * has started it's DKG session with the block of this MNList
     * @param {Buffer} selectionModifier
     * @param {number} size
     * @return {SimplifiedMNListEntry[]}
     */
    calculateQuorum(): SimplifiedMNListEntry[];


    /**
     * Calculates scores for MN selection
     * it calculates sha256(sha256(proTxHash, confirmedHash), modifier) per MN
     * Please note that this is not a double-sha256 but a single-sha256
     * @param {Buffer} modifier
     * @return {Object[]} scores
     */
    calculateScores(modifier: Buffer): Object[];

}
