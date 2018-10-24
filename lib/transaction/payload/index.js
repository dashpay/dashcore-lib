var Payload = require('./payload');

Payload.ProUpRevTxPayload = require('./prouprevtxpayload');
Payload.ProRegTxPayload = require('./proregtxpayload');
Payload.SubTxRegisterPayload = require('./subtxregisterpayload');
Payload.SubTxTopupPayload = require('./subtxtopuppayload');
Payload.SubTxTransitionPayload = require('./subtxtransitionpayload');
Payload.CoinbasePayload = require('./coinbasepayload');
Payload.ProRegTxPayload = require('./proregtxpayload');
Payload.ProTxUpServPayload = require('./proupservtxpayload');

Payload.constants = require('./constants');

module.exports = Payload;
