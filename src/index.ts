import * as path from 'path';
import updateNotifier from 'update-notifier';

import pkg from './utils/readPkg';
import { createScopedLogger } from './utils/console';

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
