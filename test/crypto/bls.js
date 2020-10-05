/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var expect = require('chai').expect;
var bls = require('../../lib/crypto/bls');

describe('bls', () => {
  it('should return bls-signatures library', () => {
    return bls.getInstance()
      .then((blsInstance) => {
        expect(blsInstance).to.be.an('Object');
        expect(blsInstance.PublicKey).to.be.a('function');
        expect(blsInstance.Signature).to.be.a('function');
        expect(blsInstance.AggregationInfo).to.be.a('function');
      });
  });
});
