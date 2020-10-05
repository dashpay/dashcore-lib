/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

// This file is used for compiling tests with webpack into one file for using with karma

const testsContext = require.context('./test', true, /\.js$/);

testsContext.keys().forEach(testsContext);
