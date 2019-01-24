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

function getProUpRevTransactionHex() {
  return '03000400016f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce05916000000006b4830450221009b50474beacd48b37340eb5715a5ebd92239e54595147b5c55018bc29f26bde302203f312cdd8009f3f03b9bb9a00074361974a40f5f5fafaf16ba4378cb72adcc4201210250a5b41488dec3d4116ae5733d18d03326050aebc3958118d647739ad1a5de24feffffff01b974ed6d000000001976a914f0ae84a7ea8a0efd48c155eeeaaed6eb64c2812188ac00000000a401006f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce05916010082cf248cf6b8ac6a3cdc826edae582ead20421659ed891f9d4953a540616fb4f05279584b3339ed2ba95711ad28b18ee2878c4a904f76ea4d103e1d739f22ff7e3b9b3db7d0c4a7e120abb4952c3574a18de34fa29828f9fe3f52bd0b1fac17acd04f7751967d782045ab655053653438f1dd1e14ba6adeb8351b78c9eb59bf4';
}

function getProUpRevTransactionJSON() {
  return {
    "txid": "6926d964bccfd4418e373f08cf41d3302f9616ee5d9bc40b18aa99fc18a3d4ea",
    "size": 357,
    "version": 3,
    "type": 4,
    "locktime": 0,
    "vin": [
      {
        "txid": "1659e06c825212c9b11325760a18f6ea06194ec4efd603f03d8704f23d818a6f",
        "vout": 0,
        "scriptSig": {
          "asm": "30450221009b50474beacd48b37340eb5715a5ebd92239e54595147b5c55018bc29f26bde302203f312cdd8009f3f03b9bb9a00074361974a40f5f5fafaf16ba4378cb72adcc42[ALL]0250a5b41488dec3d4116ae5733d18d03326050aebc3958118d647739ad1a5de24",
          "hex": "4830450221009b50474beacd48b37340eb5715a5ebd92239e54595147b5c55018bc29f26bde302203f312cdd8009f3f03b9bb9a00074361974a40f5f5fafaf16ba4378cb72adcc4201210250a5b41488dec3d4116ae5733d18d03326050aebc3958118d647739ad1a5de24"
        },
        "sequence": 4294967294
      }
    ],
    "vout": [
      {
        "value": 18.44278457,
        "valueSat": 1844278457,
        "n": 0,
        "scriptPubKey": {
          "asm": "OP_DUP OP_HASH160 f0ae84a7ea8a0efd48c155eeeaaed6eb64c28121 OP_EQUALVERIFY OP_CHECKSIG",
          "hex": "76a914f0ae84a7ea8a0efd48c155eeeaaed6eb64c2812188ac",
          "reqSigs": 1,
          "type": "pubkeyhash",
          "addresses": [
            "yiG45yiCksvpd1iLU5o3Dsj8GYRsWvGchu"
          ]
        }
      }
    ],
    "extraPayloadSize": 164,
    "extraPayload": "01006f8a813df204873df003d6efc44e1906eaf6180a762513b1c91252826ce05916010082cf248cf6b8ac6a3cdc826edae582ead20421659ed891f9d4953a540616fb4f05279584b3339ed2ba95711ad28b18ee2878c4a904f76ea4d103e1d739f22ff7e3b9b3db7d0c4a7e120abb4952c3574a18de34fa29828f9fe3f52bd0b1fac17acd04f7751967d782045ab655053653438f1dd1e14ba6adeb8351b78c9eb59bf4",
    "proUpRevTx": {
      "version": 1,
      "proTxHash": "1659e06c825212c9b11325760a18f6ea06194ec4efd603f03d8704f23d818a6f",
      "reason": 1,
      "inputsHash": "4ffb1606543a95d4f991d89e652104d2ea82e5da6e82dc3c6aacb8f68c24cf82"
    },
    "instantlock": false
  }
}

module.exports = {
  getProUpRevPayloadHex: getProUpRevPayloadHex,
  getProUpRevPayloadJSON: getProUpRevPayloadJSON,
  getProUpRevPayloadBuffer: getProUpRevPayloadBuffer,
  getProUpRevTransactionHex: getProUpRevTransactionHex,
  getProUpRevTransactionJSON: getProUpRevTransactionJSON
};
