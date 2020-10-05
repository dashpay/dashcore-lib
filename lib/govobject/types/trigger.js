/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var _ = require('lodash');
var $ = require('../../util/preconditions');
var GovObject = require('../govobject');
var errors = require('../../errors');
var inherits = require('util').inherits;


/**
 * Represents 'trigger' Governance Object
 *
 * @constructor
 */
function Trigger(serialized) {
    GovObject.call(this, serialized);
}

inherits(Trigger, GovObject);

Trigger.prototype.dataHex = function() {
    var _govObj = {
        event_block_height: this.event_block_height,
        payment_addresses: this.payment_addresses,
        payment_amounts: this.payment_amounts,
        proposal_hashes: this.proposal_hashes,
        type: this.type,
    };

    return JSON.stringify(_govObj);
};

Trigger.prototype._newGovObject = function() {
    this.event_block_height = "";
    this.payment_addresses = "";
    this.payment_amounts = "";
    this.proposal_hashes = "";
    this.type = "";
};

Trigger.prototype.fromObject = function fromObject(arg) {
    //Allow an arg to be a stringified json
    if (!(_.isObject(arg) || arg instanceof GovObject)) {
        try {
            var parsed = JSON.parse(arg);
        } catch (e) {
            throw new Error('Must be a valid stringified JSON');
        }
        return this.fromObject(parsed);
    }

    var expectedProperties = [
        ["event_block_height", "number"],
        ["payment_addresses", "string"],
        ["payment_amounts", "string"],
        ["proposal_hashes", "string"],
        ["type", "number"],
    ];
    var trigger = arg;
    var self = this;

    _.each(expectedProperties, function(prop) {
        var expectedPropName = prop[0];
        var expectedPropType = prop[1];
        var existProp = trigger.hasOwnProperty(expectedPropName);
        if (!existProp) {
            throw new Error('Must be a valid JSON - Property ' + expectedPropName + ' missing');
        }
        var receivedType = typeof trigger[expectedPropName];
        if (receivedType !== expectedPropType) {
            var err_m = 'Must be a valid JSON - Expected property ' + expectedPropName + ' to be a ' + expectedPropType + ' received:' + receivedType
            throw new Error(err_m);
        }
        var receivedValue = trigger[expectedPropName];
        if (receivedType === "number" && isNaN(receivedValue)) {
            throw new Error('Must be a valid JSON - Expected property ' + expectedPropName + ' to be a number');
        }
        self[expectedPropName] = trigger[expectedPropName];
    });

    if (trigger.type && trigger.type !== 2) {
        //Not a trigger type, we tell about it
        throw new Error("Must be a valid trigger type.");
    }
    return this;
};

Trigger.prototype.fromBufferReader = function(reader) {
  $.checkArgument(!reader.finished(), 'No data received');

  var dataHex = reader.read(reader.buf.length);
  var object = JSON.parse(dataHex.toString('utf8'));

  if (object.constructor.name === 'Array') {
    _.merge(this, object[0][1]);
  } else if (object.constructor.name === 'Object') {
    _.merge(this, object)
  } else {
    throw new Error('Invalid trigger')
  }

  return this;
};

Trigger.prototype.getSerializationError = function(opts) {
    opts = opts || {};

    var superblockCycle = 24;
    if (this.network == undefined || this.network == "mainnet" || this.network == "livenet") {
      superblockCycle = 16616;
    }

    // verify event_block_height is a number
    if (isNaN(this.event_block_height)) {
        return new errors.GovObject.Trigger.invalidEBH();
    }
    // must be a valid SB height
    if ((this.event_block_height % superblockCycle) != 0) {
        return new errors.GovObject.Trigger.invalidEBH();
    }

    var addresses = this.payment_addresses.split('|');
    var amounts = this.payment_amounts.split('|');
    var hashes = this.proposal_hashes.split('|');

    // verify matching amount of addresses / amounts / proposal hashes
    if (addresses.length != amounts.length || amounts.length != hashes.length) {
        return new errors.GovObject.Trigger.fieldsMismatch();
    }

    var self = this;
    // verify addresses
    addresses.forEach(function(addr) {
        if (!self._verifyAddress(addr, self.network)) {
            return new errors.GovObject.Trigger.invalidAddresses();
        }
        // verify not P2SH
        if (self._verifyPayToScriptHash(addr, self.network)) {
            return new errors.GovObject.Trigger.invalidP2SHAddresses();
        }
    })

    // verify payment amounts (should be non-negative number)
    amounts.forEach(function () {
        if (self._verifyPayment(self.payment_amount)) {
            return new errors.GovObject.Trigger.invalidPaymentAmounts();
        }
    })
};


module.exports = Trigger;
