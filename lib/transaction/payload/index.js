/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Payload = require('./payload');

Payload.ProRegTxPayload = require('./proregtxpayload');
Payload.ProUpRegTxPayload = require('./proupregtxpayload');
Payload.ProUpRevTxPayload = require('./prouprevtxpayload');
Payload.ProTxUpServPayload = require('./proupservtxpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.constants = require('../../constants');
Payload.CommitmentTxPayload = require('./commitmenttxpayload');
Payload.MnHfSignalPayload = require('./mnhfsignalpayload');
Payload.AssetLockPayload = require('./assetlockpayload');
Payload.AssetUnlockPayload = require('./assetunlockpayload');

module.exports = Payload;
