/* eslint-disable */

function getProRegPayloadHex() {
  return '02000000000026d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a60100000000000000000000000000ffffc38d008f4e1f8a94fb062049b841f716dcded8257a3632fb053c8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b8a94fb062049b841f716dcded8257a3632fb053c00001976a914e4876df5735eaa10a761dca8d62a7a275349022188acbc1055e0331ea0ea63caf80e0a7f417e50df6469a97db1f4f1d81990316a5e0b412045323bca7defef188065a6b30fb3057e4978b4f914e4e8cc0324098ae60ff825693095b927cd9707fe10edbf8ef901fcbc63eb9a0e7cd6fed39d50a8cde1cdb4';
}

function getProRegPayloadJSON() {
  return {
    version: 2,
    collateralHash: 'a65693797d7137a2529f438807a8c7c085d3984ceaa2f4f5230a36b536cbd326',
    collateralIndex: 1,
    service: '195.141.0.143:19999',
    keyIDOwner: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    pubKeyOperator: '8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b',
    keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    payoutAddress: 'yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH',
    operatorReward: 0,
    inputsHash: '0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc',
  };
}

function getProRegPayloadBuffer() {
  return Buffer.from(getProRegPayloadHex(), 'hex');
}

function getProRegTransactionHex() {
  return '030001000126d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a6000000006b483045022100b025cd823cf6b746e97a1e5657c1c6f150bc63530734b1c5dacef2cfad53a8ea022073d0801e18a082eaee70838f2cfc19c78b88b879af7d3e42023d61852ad289e701210222865251150a58f0f89602cb812046cc38c84d67e3dc74edb9061aaed19c2bdefeffffff0143c94fbb000000001976a9145cbfea4a74cfeb5f801f2cbaf38a9bac7ebebb0e88ac00000000fd120102000000000026d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a60100000000000000000000000000ffffc38d008f4e1f8a94fb062049b841f716dcded8257a3632fb053c8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b8a94fb062049b841f716dcded8257a3632fb053c00001976a914e4876df5735eaa10a761dca8d62a7a275349022188acbc1055e0331ea0ea63caf80e0a7f417e50df6469a97db1f4f1d81990316a5e0b412045323bca7defef188065a6b30fb3057e4978b4f914e4e8cc0324098ae60ff825693095b927cd9707fe10edbf8ef901fcbc63eb9a0e7cd6fed39d50a8cde1cdb4';
}

function getProRegTransactionJSON() {
  return {
    "txid": "62330c04f20acc541c8d4f3022ba2b032ea5530c476e61dc9c4235ac20d10f4f",
    "size": 469,
    "version": 3,
    "type": 1,
    "locktime": 0,
    "vin": [
      {
        "txid": "a65693797d7137a2529f438807a8c7c085d3984ceaa2f4f5230a36b536cbd326",
        "vout": 0,
        "scriptSig": {
          "asm":
            "3045022100b025cd823cf6b746e97a1e5657c1c6f150bc63530734b1c5dacef2cfad53a8ea022073d0801e18a082eaee70838f2cfc19c78b88b879af7d3e42023d61852ad289e7[ALL]0222865251150a58f0f89602cb812046cc38c84d67e3dc74edb9061aaed19c2bde",
          "hex":
            "483045022100b025cd823cf6b746e97a1e5657c1c6f150bc63530734b1c5dacef2cfad53a8ea022073d0801e18a082eaee70838f2cfc19c78b88b879af7d3e42023d61852ad289e701210222865251150a58f0f89602cb812046cc38c84d67e3dc74edb9061aaed19c2bde"
        },
        "sequence": 4294967294
      }
    ],
    "vout": [
      {
        "value": 31.42568259,
        "valueSat": 3142568259,
        "n": 0,
        "scriptPubKey": {
          "asm": "OP_DUP OP_HASH160 5cbfea4a74cfeb5f801f2cbaf38a9bac7ebebb0e OP_EQUALVERIFY OP_CHECKSIG",
          "hex": "76a9145cbfea4a74cfeb5f801f2cbaf38a9bac7ebebb0e88ac",
          "reqSigs": 1,
          "type": "pubkeyhash",
          "addresses": [
            "yUmrvMSVw2iKVVVfarMASnBRtdfvX6MLFr"
          ]
        }
      }
    ],
    "extraPayloadSize": 274,
    "extraPayload": "02000000000026d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a60100000000000000000000000000ffffc38d008f4e1f8a94fb062049b841f716dcded8257a3632fb053c8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b8a94fb062049b841f716dcded8257a3632fb053c00001976a914e4876df5735eaa10a761dca8d62a7a275349022188acbc1055e0331ea0ea63caf80e0a7f417e50df6469a97db1f4f1d81990316a5e0b412045323bca7defef188065a6b30fb3057e4978b4f914e4e8cc0324098ae60ff825693095b927cd9707fe10edbf8ef901fcbc63eb9a0e7cd6fed39d50a8cde1cdb4",
    "proRegTx": {
      "version": 2,
      "collateralHash": "a65693797d7137a2529f438807a8c7c085d3984ceaa2f4f5230a36b536cbd326",
      "collateralIndex": 1,
      "service": "195.141.0.143:19999",
      "keyIDOwner": "3c05fb32367a25d8dedc16f741b8492006fb948a",
      "pubKeyOperator":
        "8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b",
      "keyIDVoting": "3c05fb32367a25d8dedc16f741b8492006fb948a",
      "payoutAddress": "yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH",
      "operatorReward": 0,
      "inputsHash": "0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc"
    },
    "instantlock": false
  }
}

module.exports = {
  getProRegPayloadHex: getProRegPayloadHex,
  getProRegPayloadJSON: getProRegPayloadJSON,
  getProRegPayloadBuffer: getProRegPayloadBuffer,
  getProRegTransactionHex: getProRegTransactionHex,
  getProRegTransactionJSON: getProRegTransactionJSON
};
