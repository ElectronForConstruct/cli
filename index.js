#!/usr/bin/env node

require('@babel/polyfill');
require('@babel/register')({ cwd: __dirname });
require('./src/app');
