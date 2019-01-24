/* eslint-disable */

function getProUpRegPayloadHex() {
  return '01004f0fd120ac35429cdc616e470c53a52e032bba22304f8d1c54cc0af2040c3362000018ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda8a94fb062049b841f716dcded8257a3632fb053c1976a914f25c59be48ee1c4fd3733ecf56f440659f1d6c5088acb309a51267451a7f52e79ef2391aa952e9a0284e8fd8db56cdcae3b49b7e6dab4120c838c08b9492c5039444cac11e466df3609c585010fab636de75c687bab9f6154d9a7c26d7b5384a147fc67ddb2e66e5f773af73dbf818109aec692ed364eafd';
}

function getProUpRegPayloadJSON() {
  return {
    version: 1,
    proTxHash: '62330c04f20acc541c8d4f3022ba2b032ea5530c476e61dc9c4235ac20d10f4f',
    pubKeyOperator: '18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda',
    keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    payoutAddress: 'yiQw1FmRannHeZYrjA1iGD2vQniqjgGENc',
    inputsHash: 'ab6d7e9bb4e3cacd56dbd88f4e28a0e952a91a39f29ee7527f1a456712a509b3',
  };
}

function getProUpRegPayloadBuffer() {
  return Buffer.from(getProUpRegPayloadHex(), 'hex');
}

function getProUpRegTransactionHex() {
  return '03000300014f0fd120ac35429cdc616e470c53a52e032bba22304f8d1c54cc0af2040c3362000000006b483045022100dd412692cfc23f6b4e8853e5db29f314d9d309c4c6caa4be8bd325f74def1ad4022038eda085b8e13420e4d849e218307c97bf0873819d52968325e8f17500d534580121025f4156984bd7f24c63e63caae7b3e3ae0afb008258b9446bdc97fbd3316de3f5feffffff0194c74fbb000000001976a9140b6def979ca5d7ae8b7319d421736cab851dc7de88ac00000000e401004f0fd120ac35429cdc616e470c53a52e032bba22304f8d1c54cc0af2040c3362000018ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda8a94fb062049b841f716dcded8257a3632fb053c1976a914f25c59be48ee1c4fd3733ecf56f440659f1d6c5088acb309a51267451a7f52e79ef2391aa952e9a0284e8fd8db56cdcae3b49b7e6dab4120c838c08b9492c5039444cac11e466df3609c585010fab636de75c687bab9f6154d9a7c26d7b5384a147fc67ddb2e66e5f773af73dbf818109aec692ed364eafd';
}

function getProUpRegTransactionJSON() {
  return {
    txid: '337456ea0f912f9c2e91bdadd1cd208e77ee8a7e5d6a9a491b13fa94a40b5d97',
    size: 421,
    version: 3,
    type: 3,
    locktime: 0,
    vin: [
      {
        txid: '62330c04f20acc541c8d4f3022ba2b032ea5530c476e61dc9c4235ac20d10f4f',
        vout: 0,
        scriptSig: {
          asm:
            '3045022100dd412692cfc23f6b4e8853e5db29f314d9d309c4c6caa4be8bd325f74def1ad4022038eda085b8e13420e4d849e218307c97bf0873819d52968325e8f17500d53458[ALL]025f4156984bd7f24c63e63caae7b3e3ae0afb008258b9446bdc97fbd3316de3f5',
          hex: '483045022100dd412692cfc23f6b4e8853e5db29f314d9d309c4c6caa4be8bd325f74def1ad4022038eda085b8e13420e4d849e218307c97bf0873819d52968325e8f17500d534580121025f4156984bd7f24c63e63caae7b3e3ae0afb008258b9446bdc97fbd3316de3f5',
        },
        sequence: 4294967294,
      },
    ],
    vout: [
      {
        value: 31.42567828,
        valueSat: 3142567828,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 0b6def979ca5d7ae8b7319d421736cab851dc7de OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a9140b6def979ca5d7ae8b7319d421736cab851dc7de88ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: [
            'yMMsyo13PTnRPgW1But5dzn9uGSZtcPjhj',
          ],
        },
      },
    ],
    extraPayloadSize: 228,
    extraPayload: '01004f0fd120ac35429cdc616e470c53a52e032bba22304f8d1c54cc0af2040c3362000018ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda8a94fb062049b841f716dcded8257a3632fb053c1976a914f25c59be48ee1c4fd3733ecf56f440659f1d6c5088acb309a51267451a7f52e79ef2391aa952e9a0284e8fd8db56cdcae3b49b7e6dab4120c838c08b9492c5039444cac11e466df3609c585010fab636de75c687bab9f6154d9a7c26d7b5384a147fc67ddb2e66e5f773af73dbf818109aec692ed364eafd',
    proUpRegTx: {
      version: 1,
      proTxHash: '62330c04f20acc541c8d4f3022ba2b032ea5530c476e61dc9c4235ac20d10f4f',
      pubKeyOperator:
        '18ece819b998a36a185e323a8749e55fd3dc2e259b741f8580fbd68cbd9f51d30f4d4da34fd5afc71859dca3cf10fbda',
      keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
      payoutAddress: 'yiQw1FmRannHeZYrjA1iGD2vQniqjgGENc',
      inputsHash: 'ab6d7e9bb4e3cacd56dbd88f4e28a0e952a91a39f29ee7527f1a456712a509b3',
    },
    instantlock: false,
  };
}

module.exports = {
  getProUpRegPayloadHex: getProUpRegPayloadHex,
  getProUpRegPayloadJSON: getProUpRegPayloadJSON,
  getProUpRegPayloadBuffer: getProUpRegPayloadBuffer,
  getProUpRegTransactionHex: getProUpRegTransactionHex,
  getProUpRegTransactionJSON: getProUpRegTransactionJSON,
};
