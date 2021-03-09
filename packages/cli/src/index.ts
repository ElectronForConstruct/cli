import * as path from 'path';
import updateNotifier from 'update-notifier';

import pkg from './utils/readPkg';

import app from './app';

// eslint-disable-next-line
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  console.info('Running in development');
}

export default app;
