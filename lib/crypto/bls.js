const EventEmitter = require('events');
const BlsSignatures = require('@dashevo/bls');

const eventNames = {
  LOADED_EVENT: 'LOADED',
};

const events = new EventEmitter();
let isLoading = false;
let instance = null;

function compileWasmModule() {
  isLoading = true;
  return BlsSignatures().then((loadedInstance) => {
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

        return;
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
    const { G2Element, G1Element, BasicSchemeMPL } = BLS;

    try {
      thresholdSignature = G2Element.fromBytes(
        Uint8Array.from(Buffer.from(signatureHex, 'hex'))
      );

      publicKey = G1Element.fromBytes(
        Uint8Array.from(Buffer.from(publicKeyHex, 'hex'))
      );

      result = BasicSchemeMPL.verify(publicKey, messageHash, thresholdSignature);
    } catch (e) {
      // This line is because BLS is a c++ WebAssembly binding, it will throw
      // cryptic error messages if it fails to parse the signature.
      return result;
    } finally {
      // Values from emscripten compiled code can't be garbage collected in JS,
      // so they have to be released first using .delete method
      if (thresholdSignature) {
        thresholdSignature.delete();
      }
      if (publicKey) {
        publicKey.delete();
      }
    }

    return result;
  },

  /**
   *
   * @param {string} signatureHex
   * @param {Uint8Array} messageHash
   * @param {string[]} publicKeys
   * @param {boolean[]} signersBits
   * @return {Promise<boolean>}
   */
  async verifyAggregatedSignature(
    signatureHex,
    messageHash,
    publicKeys,
    signersBits
  ) {
    const BLS = await this.getInstance();
    let result = false;
    let thresholdSignature;

    const pks = [];
    let i = 0;

    const { G1Element, G2Element, BasicSchemeMPL } = BLS;

    publicKeys.forEach((publicKey) => {
      if (signersBits[i]) {
        pks.push(G1Element.fromBytes(
          Uint8Array.from(Buffer.from(publicKey, 'hex'))
        ));
      }
      i += 1;
    });

    try {
      thresholdSignature = G2Element.fromBytes(
        Uint8Array.from(Buffer.from(signatureHex, 'hex'))
      );

      result = BasicSchemeMPL.verifySecure(pks, thresholdSignature, messageHash);
    } catch (e) {
      // This line is because BLS is a c++ WebAssembly binding, it will throw
      // cryptic error messages if it fails to parse the signature.
      return result;
    } finally {
      // Values from emscripten compiled code can't be garbage collected in JS,
      // so they have to be released first using .delete method
      if (thresholdSignature) {
        thresholdSignature.delete();
      }

      if (pks) {
        pks.forEach((pk) => {
          pk.delete();
        });
      }
    }

    return result;
  },
};

module.exports = bls;
