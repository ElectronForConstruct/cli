import * as path from 'path'

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

// @ts-ignore
import updateNotifier from 'update-notifier';
const logger = require('./utils/console').normal('system');
import pkg from '../package.json';
import app from './app';

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  logger.info('Running in development');
}

export default app
