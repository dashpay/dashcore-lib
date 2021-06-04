/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var Payload = require('./payload');

Payload.ProRegTxPayload = require('./proregtxpayload');
Payload.ProUpRegTxPayload = require('./proupregtxpayload');
Payload.ProUpRevTxPayload = require('./prouprevtxpayload');
Payload.ProTxUpServPayload = require('./proupservtxpayload');
Payload.SubTxCloseAccountPayload = require('./subtxcloseaccountpayload');
Payload.SubTxRegisterPayload = require('./subtxregisterpayload');
Payload.SubTxResetKeyPayload = require('./subtxresetkeypayload');
Payload.SubTxTopupPayload = require('./subtxtopuppayload');
Payload.SubTxTransitionPayload = require('./subtxtransitionpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.constants = require('../../constants');
Payload.CommitmentTxPayload = require('./commitmenttxpayload');

module.exports = Payload;
