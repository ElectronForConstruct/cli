import * as path from 'path';
import updateNotifier from 'update-notifier';

import { createScopedLogger } from '@cyn/utils';
import pkg from './utils/readPkg';

import app from './app';

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const logger = createScopedLogger('system');

updateNotifier({ pkg }).notify({
  defer: true,
  isGlobal: true,
});

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  logger.info('Running in development');
}

export default app;