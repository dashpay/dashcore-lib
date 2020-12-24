var chai = require('chai');
var expect = chai.expect;

const { ZmqMessages: { ChainLockSigMessage } } = require('../../index.js');

describe('ChainLockSigMessage', function() {
    let rawChanLockSigMessage;
    let chainLockSigObject;
    let blockObject;

    beforeEach(() => {
        rawChanLockSigMessage = Buffer.from('00000020fd0ab0fc0fb0cbecb62cf7555aee6a8ce18564a9bbed8b22585d9f8563000000ee131c25019aaee0f1bdde2a5d6eb99ec0b4497e68776f18916951e8ddb6b922dd3be45f62f6011ed18800000103000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05024c0f010bffffffff0200c817a8040000001976a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac00ac23fc060000001976a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac000000004602004c0f00003d8e273bf286d48ccba5a87b5adf332ed070a15e4e2d81eeb9ff685373be5656961e0b73ea855fdac9cc530782a7f0a22d25d1eaab4b2068efa647e9da0915d02f0f00005d3be29ed65ba0509d9e1936c593a0ce53f60875d16bea3fec1c0ef93d0000001770e35c281ebfcf14b8a62071f76146eb0a5ede6fb43543a9c0ccddf3cf87fcdd0a96eea867595bb980dcea13e6283f16744631df895404434c7840f9b3d9c1069790a0459a0d35b7ae353519f5d437ded547f8d65f6c4916e988c842488e7a', 'hex');
        chainLockSigObject = {
            blockHash: '0000003df90e1cec3fea6bd17508f653cea093c536199e9d50a05bd69ee23b5d',
            height: 3887,
            signature: '1770e35c281ebfcf14b8a62071f76146eb0a5ede6fb43543a9c0ccddf3cf87fcdd0a96eea867595bb980dcea13e6283f16744631df895404434c7840f9b3d9c1069790a0459a0d35b7ae353519f5d437ded547f8d65f6c4916e988c842488e7a',
        };
        blockObject = {
            "header": {
                "bits": 503445090,
                "hash": "000000c546f0fdf0e20432a309e64ed75f05a6fdbb503bee46c813af6d4ef46d",
                "merkleRoot": "22b9b6dde8516991186f77687e49b4c09eb96e5d2adebdf1e0ae9a01251c13ee",
                "nonce": 35025,
                "prevHash": "00000063859f5d58228bedbba96485e18c6aee5a55f72cb6eccbb00ffcb00afd",
                "time": 1608793053,
                "version": 536870912
            },
            "transactions": [
                {
                    "extraPayload": "02004c0f00003d8e273bf286d48ccba5a87b5adf332ed070a15e4e2d81eeb9ff685373be5656961e0b73ea855fdac9cc530782a7f0a22d25d1eaab4b2068efa647e9da0915d0",
                    "hash": "22b9b6dde8516991186f77687e49b4c09eb96e5d2adebdf1e0ae9a01251c13ee",
                    "inputs": [
                        {
                            "outputIndex": 4294967295,
                            "prevTxId": "0000000000000000000000000000000000000000000000000000000000000000",
                            "script": "024c0f010b",
                            "sequenceNumber": 4294967295
                        }
                    ],
                    "nLockTime": 0,
                    "outputs": [
                        {
                            "satoshis": 20000000000,
                            "script": "76a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac"
                        },
                        {
                            "satoshis": 30000000000,
                            "script": "76a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac"
                        }
                    ],
                    "type": 5,
                    "version": 3
                }
            ]
        }
    })

    it('should parse the rawchainlocksig zmq message', function () {
        const chainLockSigMessage = new ChainLockSigMessage(rawChanLockSigMessage);

        expect(chainLockSigMessage.block.toObject()).to.be.deep.equal(blockObject);
        expect(chainLockSigMessage.chainLock.toObject()).to.be.deep.equal(chainLockSigObject);
    });
});
