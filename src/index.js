const updateNotifier = require('update-notifier');
const logger = require('./utils/console').normal('system');
const pkg = require('../package.json');
const app = require('./app');

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.CYN_ENV === 'development' || false;

if (isDev) {
  logger.info('Running in development');
}

app();
