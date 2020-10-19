module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      './index.js',
      './test.spec.js',
    ],
    preprocessors: {
      './index.js': ['webpack'],
      './test.spec.js': ['webpack'],
    },
    webpack: {
      node: {
        fs: 'empty',
      },
      module: {
        rules: [
          { test: /\.dat$/, use: 'raw-loader' },
          { enforce: 'post', loader: 'transform-loader?brfs' },
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
      'karma-webpack',
    ],
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
  });
};
