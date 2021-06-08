const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: ['./index.js'],
  resolve: {
    fallback: {
      fs: false,
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      assert: require.resolve('assert-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
    }
  },
  target: 'web',
  plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: 'process/browser',
      })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dashcore-lib.min.js',
    library: 'dashcore',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
