/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';

var EventEmitter = require('events');
var BlsSignatures = require('bls-signatures');

var bls = {
  isLoading: false,
  instance: null,
  events: new EventEmitter(),
  LOADED: 'LOADED',
  load() {
    this.isLoading = true;
    return BlsSignatures()
      .then((instance) => {
        this.instance = instance;
        this.isLoading = false;
        this.events.emit(this.LOADED);
      });
  },
  getInstance() {
    return new Promise((resolve) => {
      if (this.instance) {
        resolve(this.instance);
      }

      if (this.isLoading) {
        this.events.once(this.LOADED, () => {
          resolve(this.instance);
        });
      } else {
        this.load().then(() => {
          resolve(this.instance);
        });
      }
    });
  }
};

module.exports = bls;
