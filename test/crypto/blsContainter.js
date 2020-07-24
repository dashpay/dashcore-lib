/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var expect = require('chai').expect;
var blsContainer = require('../../lib/crypto/blsContainter');

describe('blsContainer', () => {
  it('should return bls-signatures library', () => {
    blsContainer.getLib()
      .then((bls) => {
        expect(bls).to.be.an('Object');
        expect(bls.PublicKey).to.be.a('function');
        expect(bls.Signature).to.be.a('function');
        expect(bls.AggregationInfo).to.be.a('function');
      });
  });
});
