/* eslint-disable */

function getProUpRevPayloadHex() {
  return '01006f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce05916010082cf248cf6b8ac6a3cdc826edae582ead20421659ed891f9d4953a540616fb4f05279584b3339ed2ba95711ad28b18ee2878c4a904f76ea4d103e1d739f22ff7e3b9b3db7d0c4a7e120abb4952c3574a18de34fa29828f9fe3f52bd0b1fac17acd04f7751967d782045ab655053653438f1dd1e14ba6adeb8351b78c9eb59bf4';
}
function getProUpRevPayloadJSON() {
  return {
    "version": 1,
    "proTxHash": "1659e06c825212c9b11325760a18f6ea06194ec4efd603f03d8704f23d818a6f",
    "reason": 1,
    "inputsHash": "4ffb1606543a95d4f991d89e652104d2ea82e5da6e82dc3c6aacb8f68c24cf82"
  };
}
function getProUpRevPayloadBuffer() {
  return Buffer.from(getProUpRevPayloadHex(), 'hex');
}

module.exports = {
  getProUpRevPayloadHex: getProUpRevPayloadHex,
  getProUpRevPayloadJSON: getProUpRevPayloadJSON,
  getProUpRevPayloadBuffer: getProUpRevPayloadBuffer,
};
