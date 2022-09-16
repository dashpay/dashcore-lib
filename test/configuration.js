const chai = require('chai');
const X11 = require('wasm-x11-hash');
const Hash = require('../lib/crypto/hash');
const crypto = require('crypto');
const x11hash = require('@dashevo/x11-hash-js');

const { configure, BlockHeader } = require("../index");

const expect = chai.expect;

const headerBuffer = Buffer.from('0400000097ea9c8bee806143a8ae50116fe3d329dcbb18b5d8ea71a7a213a1b052000000b1950f668df2593684169b0e33ee7fb1b8e00d90ed906d80b4c2baa7d1b65f548f495a57ed98521d348b0700','hex')
describe('configuration', function () {
  before(async () => {
    const x11 = await X11();
    configure({
      x11hash: {
        digest: (input) => x11.digest(input)
      },
      crypto: {
        createHash: () => ({
          update: () => ({
            digest: () => '00001111'
          })
        })
      }
    })
  });

  after(() => {
    configure({
      x11hash,
      crypto
    })
  })

  it('should use external x11 for block header hash', () => {
    const blockHeader = new BlockHeader(headerBuffer);
    expect(blockHeader.hash).to.equal('0000000cc55c08ed64afb41c7c2f382a64901eadfcc6663c4e70987fdc0e8401')
  })

  it('should use external crypto module', () => {
    const hash = Hash.sha512(Buffer.alloc(32));
    expect(hash).to.equal('00001111')
  })
});
