/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

/* jshint unused: false */
/* jshint latedef: false */
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash');
var sinon = require('sinon');

var bitcore = require('../../../index.js');
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;

var Trigger = bitcore.GovObject.Trigger;
var errors = bitcore.errors;

describe('Trigger', function() {
  var eventBlockHeight = 110976;
  var validJSONTrigger = {
    network: "testnet",
    event_block_height: 110976,
    payment_addresses: 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y',
    payment_amounts: '10.00000000|12.00000000',
    proposal_hashes: '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7',
    type: 2,
  };

  it('should create new trigger', function() {
    var trigger = new Trigger();
    trigger.network = 'testnet';
    trigger.event_block_height = 110976;
    trigger.payment_addresses = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y';
    trigger.payment_amounts = '10.00000000|12.00000000';
    trigger.proposal_hashes = '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7';
    trigger.type = 2;

    trigger.serialize().should.equal(expectedHex);
  });

  it('should throw error if invalid SB height', function() {
    var trigger = new Trigger();
    trigger.event_block_height = 110975;
    trigger.payment_addresses = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y';
    trigger.payment_amounts = '10.00000000|12.00000000';
    trigger.proposal_hashes = '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7';
    trigger.type = 2;

    expect(function() {
      return trigger.serialize();
    }).to.throw(errors.GovObject.Trigger.invalidEBH);
  });

  // test for mismatched number of addresses / amounts / hashes
  it('should return error if mismatched addresses / amounts / hashes', function() {
    var trigger = new Trigger();
    trigger.network = 'testnet';
    trigger.event_block_height = 110976;
    trigger.payment_addresses = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
    trigger.payment_amounts = '10.00000000|12.00000000';
    trigger.proposal_hashes = '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7';
    trigger.type = 2;
    expect(function() {
      return trigger.serialize();
    }).to.throw(errors.GovObject.Trigger.fieldsMismatch);

    trigger.payment_addresses = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y';
    trigger.payment_amounts = '10.00000000';
    expect(function() {
      return trigger.serialize();
    }).to.throw(errors.GovObject.Trigger.fieldsMismatch);

    trigger.payment_amounts = '10.00000000|12.00000000';
    trigger.proposal_hashes = '6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7';
    expect(function() {
      return trigger.serialize();
    }).to.throw(errors.GovObject.Trigger.fieldsMismatch);
  });

  it('should create a new trigger from a hex string', function() {
    var Trigger = bitcore.GovObject.Trigger;
    var trigger = new Trigger(expectedHex);
    trigger.network = 'testnet';

    expect(trigger instanceof Trigger);
    trigger.serialize().should.equal(expectedHex);
  });

  it('should return error if not valid stringified JSON', function() {
    var stringifiedJSON = JSON.stringify(validJSONTrigger);

    //create an invalid stringified JSON
    stringifiedJSON += "foobar";

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(stringifiedJSON);
    };
    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid stringified JSON');
  });

  it('should return error if property event_block_height is missing', function() {
    var jsonTrigger = {
      payment_addresses: 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y',
      payment_amounts: '10.00000000|12.00000000',
      proposal_hashes: '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7',
      type: 2,
    };

    var stringifiedJSON = JSON.stringify(jsonTrigger);
    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(stringifiedJSON);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Property event_block_height missing');
  });

  it('should return error if property event_block_height is NaN', function() {
    var jsonTrigger = {
      event_block_height: '110975',
      payment_addresses: 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y',
      payment_amounts: '10.00000000|12.00000000',
      proposal_hashes: '20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7',
      type: 2,
    };

    var stringifiedJSON = JSON.stringify(jsonTrigger);
    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(stringifiedJSON);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Expected property event_block_height to be a number');
  });

  it('should return error if property payment_addresses is missing', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    delete jsonTrigger.payment_addresses;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Property payment_addresses missing');
  });

  it('should return error if property payment_amounts is missing', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    delete jsonTrigger.payment_amounts;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Property payment_amounts missing');
  });

  it('should return error if property proposal_hashes is missing', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    delete jsonTrigger.proposal_hashes;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Property proposal_hashes missing');
  });

  it('should return error if property type is missing', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    delete jsonTrigger.type;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Property type missing');
  });

  it('should return error if property payment_addresses is bad typed', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    jsonTrigger.payment_addresses = 1;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Expected property payment_addresses to be a string received:number');
  });

  it('should return error if property payment_amounts is bad typed', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    jsonTrigger.payment_amounts = 1;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Expected property payment_amounts to be a string received:number');
  });

  it('should return error if property proposal_hashes is bad typed', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    jsonTrigger.proposal_hashes = 1;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Expected property proposal_hashes to be a string received:number');
  });

  it('should return error if property type is bad typed', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    jsonTrigger.type = "2";

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid JSON - Expected property type to be a number received:string');
  });

  it('should return error if property type is not a trigger', function() {
    //Cloning obj
    var jsonTrigger = JSON.parse(JSON.stringify(validJSONTrigger));
    jsonTrigger.type = 42;

    var trigger = new Trigger();
    var triggerRes = function() {
      return trigger.fromObject(jsonTrigger);
    };

    expect(triggerRes).to.throw(Error);
    expect(triggerRes).to.throw('Must be a valid trigger type.');
  });

  it('should parse a serialised datahex trigger', function() {
    var datahex = '7b226576656e745f626c6f636b5f686569676874223a3131303937362c227061796d656e745f616464726573736573223a22795847654e505158594658684c414e315a4b72416a787a7a426e5a324a5a4e4b6e687c7958426a383634614d4a34624e4d3375545772733665625864524273546265413979222c227061796d656e745f616d6f756e7473223a2231302e30303030303030307c31322e3030303030303030222c2270726f706f73616c5f686173686573223a22323035393664343161633663396636626662396130326534336364373765663165643161306539643730383537653531313065366161396465306365313266627c36373637393237373631383930656566616136663830353432616164363938316662393636656564376331646561663631363436346137333964383162386437222c2274797065223a327d';

    var trigger = new Trigger(datahex);
    expect(trigger.toString()).to.equal(datahex);
    expect(trigger.type).to.equal(2);
    expect(trigger.event_block_height).to.equal(110976);
    expect(trigger.payment_addresses).to.equal('yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh|yXBj864aMJ4bNM3uTWrs6ebXdRBsTbeA9y');
    expect(trigger.payment_amounts).to.equal('10.00000000|12.00000000');
    expect(trigger.proposal_hashes).to.equal('20596d41ac6c9f6bfb9a02e43cd77ef1ed1a0e9d70857e5110e6aa9de0ce12fb|6767927761890eefaa6f80542aad6981fb966eed7c1deaf616464a739d81b8d7');
  });

});
var expectedHex = '7b226576656e745f626c6f636b5f686569676874223a3131303937362c227061796d656e745f616464726573736573223a22795847654e505158594658684c414e315a4b72416a787a7a426e5a324a5a4e4b6e687c7958426a383634614d4a34624e4d3375545772733665625864524273546265413979222c227061796d656e745f616d6f756e7473223a2231302e30303030303030307c31322e3030303030303030222c2270726f706f73616c5f686173686573223a22323035393664343161633663396636626662396130326534336364373765663165643161306539643730383537653531313065366161396465306365313266627c36373637393237373631383930656566616136663830353432616164363938316662393636656564376331646561663631363436346137333964383162386437222c2274797065223a327d';
