import * as path from 'path';
import fs from 'fs-extra';
import setupDir from '../../utils/setupDir';
import { createScopedLogger } from '../../utils/console';
import Hook from '../../classes/hook';

const config = {

};

export default {
  description: 'Setup the directory',
  name: 'electron/setup',
  config,
  run: async function run({ workingDirectory, hookSettings }) {
    const tempDir = await setupDir('build', hookSettings);

    return {
      sources: [tempDir],
    };
  },
} as Hook;
