import * as path from 'path';
import os from 'os';
import fs from 'fs-extra';
// @ts-ignore
import init from 'tauri/dist/api/init';
import Task from '../../classes/task';
import { SetupConfig } from '../../models';

const config: any = {
};

export default {
  description: 'Setup the directory',
  name: 'tauri/setup',
  config,
  run: async function run({ workingDirectory, taskSettings }) {
    const settings = taskSettings as SetupConfig;

    const tmpDir = path.join(os.tmpdir(), `cyn_tauri_${path.basename(process.cwd())}`);
    console.log('tmpDir', tmpDir);
    await fs.ensureDir(tmpDir);
    const done = await init({
      directory: tmpDir,
      force: false,
      logging: true,
    });
    console.log('done', done);

    const dest = path.join(tmpDir, 'app');
    await fs.ensureDir(dest);

    const ignore = [
      'dist', '.cache', '.cyn', '.cynrc.yml',
    ].map((entry) => path.resolve(process.cwd(), entry));

    await fs.copy(process.cwd(), dest, {
      filter: (src) => !ignore.includes(src),
    });

    const dir = path.join(tmpDir);
    process.chdir(dir);

    console.log('process.cwd()', process.cwd());

    // const info = require('tauri/dist/api/info');

    // const infos = await info();
    // console.log('infos', infos);

    return {
      sources: [tmpDir],
    };
  },
} as Task;
