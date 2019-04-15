const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const Sentry = require('@sentry/node');
const os = require('os');
const pkg = require('../package.json');
const app = require('./app');
const box = require('./box');

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


app().then(() => {
  console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
});
