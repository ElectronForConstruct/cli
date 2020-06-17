import * as path from 'path';
import fs from 'fs-extra';
import setupDir from '../utils/setupDir';
import { createScopedLogger } from '../utils/console';

interface Config {
  filename: string,
  files: string[]
}

const config: Config = {
  filename: 'checksum',
  files: [],
};

export default {
  description: 'Setup the directory',
  name: 'setup',
  config,
  run: async function run(
    {
      workingDirectory,
      hookSettings,
    }: {
      workingDirectory: string
      settings: any
      hookSettings: Config
    },
  ): Promise<boolean> {
    const logger = createScopedLogger('setup', {
      interactive: true,
    });

    const tempDir = await setupDir('build');

    return true;
  },
};
