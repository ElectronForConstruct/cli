#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./src');
