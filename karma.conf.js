/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';
var path = require('path')

var src = './index.js',
    tests = './test.spec.js';

var karmaConfig = {
  frameworks: ['mocha', 'chai'],
  files: [
    src,
    tests
  ],
  preprocessors: {},
  webpack: {
    node: {
      fs: 'empty',
    },
    module: {
      rules: [
        { test: /\.dat$/, use: "raw-loader" },
        { enforce:'post', loader: "transform-loader?brfs" },
      ],
    },
  },
  reporters: ['mocha'],
  port: 9876,
  colors: true,
  autoWatch: false,
  browsers: ['ChromeHeadless', 'FirefoxHeadless'],
  singleRun: false,
  concurrency: Infinity,
  plugins: [
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-webpack'
  ],
  customLaunchers: {
    FirefoxHeadless: {
      base: 'Firefox',
      flags: ['-headless'],
    },
  },
};
karmaConfig.preprocessors[src] = ['webpack'];
karmaConfig.preprocessors[tests] = ['webpack'];

// karma.conf.js
module.exports = function(config) {
  config.set(karmaConfig);
};
