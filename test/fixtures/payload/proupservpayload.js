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

function getProUpServTransactionHex() {
  return '03000200017b1100a3e33b86b1e9948a1091648b44ac2e819850e321bbbbd9a7825cf173c8000000006a473044022028f2ca816270068494686ed25ff64590c3a04f0b730d7e52e751adf640a9e4de02200379a4757738e83c24d25988c6cb4aed39120c985347a13e35401da41458ee0e012103a306d65010b0cb287de227a22b978973a0902174fe8bec61519d91183c97d9a1feffffff01e5f5b47f000000001976a914b45868066caf1c974bd7d0fb42c896cecdeccc9588ac00000000ce01007b1100a3e33b86b1e9948a1091648b44ac2e819850e321bbbbd9a7825cf173c800000000000000000000ffffc38d8f314e1f1976a9143e1f214c329557ae3711cb173bcf04d00762f3ff88ac3f7685789f3e6480ba6ed402285da0ed9cd0558265603fa8bad0eec0572cf1eb1746f9c46d654879d9afd67a439d4bc2ef7c1b26de2e59897fa83242d9bd819ff46c71d9e3d7aa1772f4003349b777140bedebded0a42efd64baf34f59c4a79c128df711c10a45505a0c2a94a5908f1642cbb56730f16b2cc2419a45890fb8ff'
}

function getProUpServTransactionJSON() {
  return {
    "txid": "8bbba69857ce67e93a580cb32ff4fa3b8be3f7101fec7bd5d736eb4466305094",
    "size": 398,
    "version": 3,
    "type": 2,
    "locktime": 0,
    "vin": [
      {
        "txid": "c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b",
        "vout": 0,
        "scriptSig": {
          "asm": "3044022028f2ca816270068494686ed25ff64590c3a04f0b730d7e52e751adf640a9e4de02200379a4757738e83c24d25988c6cb4aed39120c985347a13e35401da41458ee0e[ALL]03a306d65010b0cb287de227a22b978973a0902174fe8bec61519d91183c97d9a1",
          "hex": "473044022028f2ca816270068494686ed25ff64590c3a04f0b730d7e52e751adf640a9e4de02200379a4757738e83c24d25988c6cb4aed39120c985347a13e35401da41458ee0e012103a306d65010b0cb287de227a22b978973a0902174fe8bec61519d91183c97d9a1"
        },
        "sequence": 4294967294
      }
    ],
    "vout": [
      {
        "value": 21.42565861,
        "valueSat": 2142565861,
        "n": 0,
        "scriptPubKey": {
          "asm": "OP_DUP OP_HASH160 b45868066caf1c974bd7d0fb42c896cecdeccc95 OP_EQUALVERIFYOP_CHECKSIG",
          "hex": "76a914b45868066caf1c974bd7d0fb42c896cecdeccc9588ac",
          "reqSigs": 1,
          "type": "pubkeyhash",
          "addresses": [
            "ycm2PK88JoLumDfztYdCbwfM1PnvE3gBGf"
          ]
        }
      }
    ],
    "extraPayloadSize": 206,
    "extraPayload": "01007b1100a3e33b86b1e9948a1091648b44ac2e819850e321bbbbd9a7825cf173c800000000000000000000ffffc38d8f314e1f1976a9143e1f214c329557ae3711cb173bcf04d00762f3ff88ac3f7685789f3e6480ba6ed402285da0ed9cd0558265603fa8bad0eec0572cf1eb1746f9c46d654879d9afd67a439d4bc2ef7c1b26de2e59897fa83242d9bd819ff46c71d9e3d7aa1772f4003349b777140bedebded0a42efd64baf34f59c4a79c128df711c10a45505a0c2a94a5908f1642cbb56730f16b2cc2419a45890fb8ff",
    "proUpServTx": {
      "version": 1,
      "proTxHash": "c873f15c82a7d9bbbb21e35098812eac448b6491108a94e9b1863be3a300117b",
      "service": "195.141.143.49:19999",
      "operatorPayoutAddress": "yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7",
      "inputsHash": "ebf12c57c0eed0baa83f60658255d09ceda05d2802d46eba80643e9f7885763f"
    },
    "instantlock": false
  }
}

module.exports = {
  getProUpServPayloadHex: getProUpServPayloadHex,
  getProUpServPayloadJSON: getProUpServPayloadJSON,
  getProUpServPayloadBuffer: getProUpServPayloadBuffer,
  getProUpServTransactionHex: getProUpServTransactionHex,
  getProUpServTransactionJSON: getProUpServTransactionJSON
};
