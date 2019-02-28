#!/usr/bin/env node

const path = require('path');

require('@babel/register')({
  cwd: path.resolve(__dirname),
  ignore: [/node_modules/],
  rootMode: 'upward',
});
require('@babel/polyfill');

require('./src/app');
