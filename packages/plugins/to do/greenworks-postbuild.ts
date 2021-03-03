import path from 'path';
// import nodeAbi from 'node-abi'
import fs from 'fs-extra';
import got from 'got';
import Task from '../classes/Task';

interface Config {
  steamId: number;
  sdkPath: string;
  localGreenworksPath: string | null;
}

const config: Config = {
  steamId: 480,
  sdkPath: 'steam_sdk',
  localGreenworksPath: null,
};

export default {
  description: 'Run on the post build step',
  name: 'greenworks-post-build',
  config,
  run: async function run(
    {
      taskSettings,
      workingDirectory,
    },
  ) {
    const { steamId } = taskSettings as Config;

    await fs.writeFile(path.join(workingDirectory, 'steam_appid.txt'), steamId, 'utf8');
    return {
      source: workingDirectory,
    };
  },
} as Task;
