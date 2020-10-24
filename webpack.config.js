const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: ['./index.js'],
  node: {
    fs: 'empty',
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dashcore-lib.min.js',
    library: 'dashcore',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: false,
    })],
  },
};
