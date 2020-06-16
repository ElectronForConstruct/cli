import path from 'path';
// import nodeAbi from 'node-abi'
import fs from 'fs-extra';
import got from 'got';

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
      hookSettings,
      workingDirectory,
    }: {
      workingDirectory: string;
      settings: any;
      hookSettings: Config;
    },
  ): Promise<boolean> {
    const { steamId } = hookSettings;

    await fs.writeFile(path.join(workingDirectory, 'steam_appid.txt'), steamId, 'utf8');
    return true;
  },
};
