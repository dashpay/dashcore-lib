/* eslint-disable */

function getProRegTxHex() {
  return '01000000000026d3cb36b5360a23f5f4a2ea4c98d385c0c7a80788439f52a237717d799356a60100000000000000000000000000ffffc38d008f4e1f8a94fb062049b841f716dcded8257a3632fb053c8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b8a94fb062049b841f716dcded8257a3632fb053c00001976a914e4876df5735eaa10a761dca8d62a7a275349022188acbc1055e0331ea0ea63caf80e0a7f417e50df6469a97db1f4f1d81990316a5e0b412045323bca7defef188065a6b30fb3057e4978b4f914e4e8cc0324098ae60ff825693095b927cd9707fe10edbf8ef901fcbc63eb9a0e7cd6fed39d50a8cde1cdb4';
}
function getProRegTxJSON() {
  return {
    version: 1,
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
function getProRegTxBuffer() {
  return Buffer.from(getProRegTxHex(), 'hex');
}

module.exports = {
  getProRegTxHex: getProRegTxHex,
  getProRegTxJSON: getProRegTxJSON,
  getProRegTxBuffer: getProRegTxBuffer
};
