import * as path from 'path';
import fs from 'fs-extra';
import got from 'got';
import extract from 'extract-zip';
import { exec } from 'child_process';
import signale from 'signale';
import os from 'os';
import { settings } from 'cluster';
import { Settings } from '../models';
import { createScopedLogger } from '../utils/console';


interface Config {
  enable: boolean;
  companyName: string;
  submitURL: string;
}

const config: Config = {
  enable: false,
  companyName: '',
  submitURL: '',
};

export default {
  description: 'Configure crash reporter',
  name: 'crash-reporter',
  config,
  run: function run(
    {
      hookSettings,
    }: {
      workingDirectory: string;
      settings: any;
      hookSettings: Config;
    },
  ): boolean {
    const logger = createScopedLogger('itch', {
      interactive: true,
    });

    if (!hookSettings.enable) {
      logger.info('crash reporter is not enabled.');
      return true;
    }

    if (!hookSettings.companyName || !hookSettings.submitURL) {
      throw new Error('"crash-reporter.companyName" and "crash-reporter.submitURL" are required in order to enable the crash reporter');
    }

    return true;
  },
};
