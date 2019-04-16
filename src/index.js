const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const Sentry = require('@sentry/node');
const os = require('os');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const app = require('./app');

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  console.log('Running in development');
} else {
  Sentry.init({
    dsn: 'https://847cb74dd8964d4f81501ed1d29b18f6@sentry.io/1406240',
  });

  Sentry.configureScope((scope) => {
    scope.setExtra('os', os.platform());
    scope.setExtra('arch', os.arch());
    scope.setExtra('hostname', os.hostname());
    scope.setExtra('cliVersion', pkg.version);
  });
}

app();
