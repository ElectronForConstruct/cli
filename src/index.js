const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const updateNotifier = require('update-notifier');
const logger = require('./utils/console').normal('system');
const pkg = require('../package.json');
const app = require('./app');

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  logger.info('Running in development');
}

app();
