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

module.exports = {
  getProUpRegPayloadHex: getProUpRegPayloadHex,
  getProUpRegPayloadJSON: getProUpRegPayloadJSON,
  getProUpRegPayloadBuffer: getProUpRegPayloadBuffer,
};
