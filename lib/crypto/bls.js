const EventEmitter = require('events');
const BlsSignatures = require('bls-signatures');

const eventNames = {
  LOADED_EVENT: 'LOADED',
};

const events = new EventEmitter();
let isLoading = false;
let instance = null;

function compileWasmModule() {
  isLoading = true;
  return BlsSignatures()
    .then((loadedInstance) => {
      instance = loadedInstance;
      isLoading = false;
      events.emit(eventNames.LOADED_EVENT);
    });
}

const bls = {
  /**
   * Compiles BlsSignature instance if it wasn't compiled yet
   * and returns module instance
   * @return {Promise<BlsSignatures>}
   */
  getInstance() {
    return new Promise((resolve) => {
      if (instance) {
        resolve(instance);
      }

      if (isLoading) {
        events.once(eventNames.LOADED_EVENT, () => {
          resolve(instance);
        });
      } else {
        compileWasmModule().then(() => {
          resolve(instance);
        });
      }
    });
  },

  /**
   * Validate bls signature
   * @param {string} signatureHex
   * @param {Uint8Array} messageHash
   * @param {string} publicKeyHex
   * @return {Promise<boolean>}
   */
  async verifySignature(signatureHex, messageHash, publicKeyHex) {
    const BLS = await this.getInstance();
    let result = false;

    let thresholdSignature;
    let publicKey;
    let aggregationInfo;

    try {
      thresholdSignature = BLS.Signature.fromBytes(Uint8Array.from(Buffer.from(signatureHex, 'hex')));
      publicKey = BLS.PublicKey.fromBytes(Uint8Array.from(Buffer.from(publicKeyHex, 'hex')));
      aggregationInfo = BLS.AggregationInfo.fromMsgHash(publicKey, messageHash);

      thresholdSignature.setAggregationInfo(aggregationInfo);

      result = thresholdSignature.verify();
    } catch (e) {
      // This line is because BLS is a c++ WebAssembly binding, it will throw
      // cryptic error messages if it fails to parse the signature.
      return result;
    } finally {
      // Values from emscripten compiled code can't be garbage collected in JS,
      // so they have to be released first using .delete method
      if (thresholdSignature) { thresholdSignature.delete(); }
      if (publicKey) { publicKey.delete(); }
      if (aggregationInfo) { aggregationInfo.delete(); }
    }

    return result;
  },

  /**
   * @param publicKeys
   * @param signersBits
   * @return {Promise<string>} - hex string with the aggregated public key
   */
  async aggregatePublicKey(publicKeys, signersBits) {
    const BLS = await this.getInstance();
    const pks = [];
    let i = 0;

    publicKeys.forEach((publicKey) => {
      if (signersBits[i]) {
        pks.push(BLS.PublicKey.fromBytes(
          Uint8Array.from(Buffer.from(publicKey, 'hex')),
        ));
      }
      i += 1;
    });

    const aggregatedKey = BLS.PublicKey.aggregate(pks);
    const aggregatedKeyHex = Buffer.from(aggregatedKey.serialize()).toString('hex');

    // Freeing memory, looks at the comment in finally {} of verifySignature for more info
    pks.forEach(pk => pk.delete());
    aggregatedKey.delete();

    return aggregatedKeyHex;
  },
  /**
   *
   * @param {string} signatureHex
   * @param {Uint8Array} messageHash
   * @param {string[]} publicKeys
   * @param {boolean[]} signersBits
   * @return {Promise<boolean>}
   */
  async verifyAggregatedSignature(signatureHex, messageHash, publicKeys, signersBits) {
    const publicKey = await this.aggregatePublicKey(publicKeys, signersBits);

    return this.verifySignature(signatureHex, messageHash, publicKey);
  },
};

module.exports = bls;
