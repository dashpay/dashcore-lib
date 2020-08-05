/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const commonJSConfig = {
  entry: ['./index.js'],
  module: {
    rules: [],
  },
  node: {
    fs: "empty"
  },
  target: 'web',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/bls-signatures/blsjs.wasm',
          to: '.',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      'request': 'browser-request',
    },
  },
};

const rawConfig = Object.assign({}, commonJSConfig, {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dashcore-lib.js',
    library: 'dashcore',
    libraryTarget: 'umd',
  }
})
const uglifiedConfig = Object.assign({}, commonJSConfig, {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dashcore-lib.min.js',
    library: 'dashcore',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
})

module.exports = [rawConfig, uglifiedConfig];
