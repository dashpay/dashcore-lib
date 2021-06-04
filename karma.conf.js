const webpack = require('webpack');

module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai', 'webpack'],
    files: ['./index.js', './test.spec.js'],
    preprocessors: {
      './index.js': ['webpack'],
      './test.spec.js': ['webpack'],
    },
    webpack: {
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
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: 'process/browser',
        })
      ],
      module: {
        rules: [
          { test: /\.dat$/, use: 'raw-loader' },
          { enforce: 'post', loader: "transform-loader", options: "brfs-node-15" },
        ],
      },
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    autoWatch: false,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: false,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout : 60000,
    browserDisconnectTolerance : 2,
    concurrency: Infinity,
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-webpack',
    ],
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      }
    },
  });
};
