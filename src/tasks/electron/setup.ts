import * as path from 'path';
import setupDir from '../../utils/setupDir';
import Task from '../../classes/task';
import { SetupConfig } from '../../models';

const config: SetupConfig = {
  version: '8.2.4',
  clearCache: true,
  project: {
    author: 'Me',
  },
};

export default {
  description: 'Setup the directory',
  name: 'electron/setup',
  config,
  run: async function run({ workingDirectory, taskSettings }) {
    const settings = taskSettings as SetupConfig;
    const tempDir = await setupDir('build', settings);

    return {
      sources: [tempDir],
    };
  },
} as Task;
