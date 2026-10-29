const { expect } = require('chai');
const isDenseArray = require('../../lib/util/isDenseArray');

describe('isDenseArray', () => {
  it('should accept arrays whose keys are exactly their indexes', () => {
    expect(isDenseArray([])).to.be.true;
    expect(isDenseArray([1, undefined, 'a'])).to.be.true;
  });

  it('should reject non-arrays and arrays with holes', () => {
    expect(isDenseArray({ length: 0 })).to.be.false;
    expect(isDenseArray('ab')).to.be.false;
    // eslint-disable-next-line no-sparse-arrays
    expect(isDenseArray([1, , 3])).to.be.false;
  });

  it('should reject extra properties, even when they make up for a hole', () => {
    const replaced = [];
    replaced.length = 1;
    replaced.extra = true;
    expect(isDenseArray(replaced)).to.be.false;

    const added = [1];
    added.extra = true;
    expect(isDenseArray(added)).to.be.false;
  });

  it('should reject a huge sparse array without materializing it', () => {
    const started = Date.now();
    expect(isDenseArray(new Array(2 ** 32 - 1))).to.be.false;
    expect(Date.now() - started).to.be.below(1000);
  });
});
