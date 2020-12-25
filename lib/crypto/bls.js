const EventEmitter = require('events');
const BlsSignatures = require('bls-signatures');

const bls = {
  isLoading: false,
  instance: null,
  events: new EventEmitter(),
  LOADED: 'LOADED',
  load() {
    this.isLoading = true;
    return BlsSignatures()
      .then((instance) => {
        this.instance = instance;
        this.isLoading = false;
        this.events.emit(this.LOADED);
      });
  },
  getInstance() {
    return new Promise((resolve) => {
      if (this.instance) {
        resolve(this.instance);
      }

      if (this.isLoading) {
        this.events.once(this.LOADED, () => {
          resolve(this.instance);
        });
      } else {
        this.load().then(() => {
          resolve(this.instance);
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
    const blsInstance = await this.getInstance();
    let result = false;

    let thresholdSignature;
    let quorumPubKey;
    let aggregationInfo;

    try {
      thresholdSignature = blsInstance.Signature.fromBytes(Uint8Array.from(Buffer.from(signatureHex, 'hex')));
      quorumPubKey = blsInstance.PublicKey.fromBytes(Uint8Array.from(Buffer.from(publicKeyHex, 'hex')));
      aggregationInfo = blsInstance.AggregationInfo.fromMsgHash(quorumPubKey, messageHash);

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
      if (quorumPubKey) { quorumPubKey.delete(); }
      if (aggregationInfo) { aggregationInfo.delete(); }
    }

    return result;
  },
};

module.exports = bls;
