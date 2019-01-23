/* eslint-disable */

function getProUpServPayloadHex() {
  return '01007b1100a3e33b86b1e9948a1091648b44ac2e819850e321bbbbd9a7825cf173c800000000000000000000ffffc38d8f314e1f1976a9143e1f214c329557ae3711cb173bcf04d00762f3ff88ac3f7685789f3e6480ba6ed402285da0ed9cd0558265603fa8bad0eec0572cf1eb1746f9c46d654879d9afd67a439d4bc2ef7c1b26de2e59897fa83242d9bd819ff46c71d9e3d7aa1772f4003349b777140bedebded0a42efd64baf34f59c4a79c128df711c10a45505a0c2a94a5908f1642cbb56730f16b2cc2419a45890fb8ff';
}
function getProUpServPayloadJSON() {
  return {
    version: 1,
    proTxHash: 'c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b',
    service: '195.141.143.49:19999',
    operatorPayoutAddress: 'yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7',
    inputsHash: 'ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f',
  };
}
function getProUpServPayloadBuffer() {
  return Buffer.from(getProUpServPayloadHex(), 'hex');
}

module.exports = {
  getProUpServPayloadHex: getProUpServPayloadHex,
  getProUpServPayloadJSON: getProUpServPayloadJSON,
  getProUpServPayloadBuffer: getProUpServPayloadBuffer,
};
