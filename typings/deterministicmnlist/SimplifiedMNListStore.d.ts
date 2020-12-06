import {SimplifiedMNListDiff} from "./SimplifiedMNListDiff";
import {SimplifiedMNList} from "./SimplifiedMNList";

export class SimplifiedMNListStore {
  constructor(diffArray: SimplifiedMNListDiff[], options: any);

  network: string
  options: any;
  maxDiffs: number;
  diffStore: any[];
  baseSimplifiedMNList: SimplifiedMNList;
  currentSML: SimplifiedMNList;
  baseHeight: number;
  baseBlockHash: string;
  tipHeight: number;
  tipHash: string;

  /**
   * Updates height and hash for latest block
   * @param {number} height
   * @param {string} hash
   */
  updateTipInfo(height: number, hash: string): void;

  /**
   * Adds a new SimplifiedMNListDiff to the store.
   * If SMLSTORE_MAX_DIFFS reached it drops the oldest
   * @param {SimplifiedMNListDiff} diff
   */
  addDiff(diff: SimplifiedMNListDiff): void

  /**
   * Returns height for latest block
   * @returns {number}
   */
  getTipHeight(): number;

  /**
   * Returns hash for latest block
   * @returns {string}
   */
  getTipHash(): string;

  /**
   * Returns a SimplifiedMNList by block height
   * @param {number} height
   * @returns {SimplifiedMNList}
   */
  getSMLbyHeight(height: number): SimplifiedMNList;

  /**
   * Returns the SimplifiedMNList of the most recent block
   * @returns {SimplifiedMNList}
   */
  getCurrentSML(): SimplifiedMNList;
}
