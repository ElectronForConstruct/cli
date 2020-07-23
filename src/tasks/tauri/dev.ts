import path from 'path';
import Task from '../../classes/task';
import { SetupConfig } from '../../models';

const config: any = {
};

export default {
  description: 'Setup the directory',
  name: 'tauri/dev',
  config,
  run: async function run({ workingDirectory, taskSettings }) {
    const settings = taskSettings as SetupConfig;

    process.chdir(workingDirectory);

    const dev = require('tauri/dist/api/dev');

    const done = await dev({
      build: {
        distDir: path.join(workingDirectory, 'dist'),
        devPath: 'http://127.0.0.1:8080/',
      },
    });

    return {
      sources: [workingDirectory],
    };
  },
} as Task;
