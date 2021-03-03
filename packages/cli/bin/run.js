#!/usr/bin/env node

require('source-map-support').install();

const fs = require('fs');
const path = require('path');

const app = require('../dist').default;

app()
  .catch((e) => {
    console.error(e);
  });
