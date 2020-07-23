import path from 'path';
// @ts-ignore
import abis from 'modules-abi';
import fs from 'fs-extra';
import got, { Progress } from 'got';
import { Signale } from 'signale';
import { createScopedLogger } from '@cyn/utils';
import { GHRelease } from '../models';
import Task from '../classes/Task';

async function request<T>(url: string): Promise<T> {
  return got(url, {
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
  }).json();
}

async function downloadFile(url: string, mypath: string, logger: Signale): Promise<any> {
  return new Promise((resolve) => {
    const stream = got.stream(url);
    stream
      .on('downloadProgress', (progress: Progress): void => {
        logger.log(`${Math.round(progress.percent * 100)}%`);
      })
      .pipe(fs.createWriteStream(
        mypath,
      ))
      .on('finish', () => {
        resolve(got);
      });
  });
}

interface Config {
  steamId: number;
  sdkPath: string;
  localGreenworksPath: string | null;
  prebuildsVersion: string;
}

const config: Config = {
  steamId: 480,
  sdkPath: 'steam_sdk',
  localGreenworksPath: null,
  prebuildsVersion: 'latest',
};

export default {
  description: 'Initialize greenworks',
  name: 'greenworks-post-build',
  config,
  run: async function run(
    {
      taskSettings,
      workingDirectory,
      settings,
    },
  ) {
    const logger = createScopedLogger('greenworks', {
      interactive: true,
    });

    const {
      steamId,
      sdkPath,
      localGreenworksPath,
      prebuildsVersion,
    } = taskSettings as Config;

    const { electron } = settings as any;

    const greenworksDir = path.join(workingDirectory, 'greenworks');
    const greenworksLibsDir = path.join(greenworksDir, 'lib');

    if (!sdkPath) {
      logger.error('Please specify a path to your steam sdk in the configuration file');
      return {
        error: '',
        sources: [],
      };
    }

    if (!fs.existsSync(sdkPath)) {
      logger.error(`${sdkPath} does not exist! Please, specify a valid path to your steam sdk.`);
      return {
        error: '',
        sources: [],
      };
    }

    // -----------------------///

    // Create greenworks directory
    logger.info('Generating required folders');

    if (!fs.existsSync(greenworksDir)) {
      await fs.ensureDir(greenworksDir);
    }
    if (!fs.existsSync(greenworksLibsDir)) {
      await fs.ensureDir(greenworksLibsDir);
    }

    // Generate steamId
    if (!steamId) {
      logger.error('Please specify a steam game id in the configuration file');
      return {
        error: '',
        sources: [],
      };
    }

    logger.info('Downloading greenworks');

    const steamAppIdPath = path.join(greenworksDir, 'steam_appid.txt');
    await fs.writeFile(steamAppIdPath, steamId, 'utf8');

    // Download latest greenworks init
    const greenworksjsPath = path.join(greenworksDir, 'greenworks.js');
    const greenworksFileRemoteContent = await request('https://raw.githubusercontent.com/greenheartgames/greenworks/master/greenworks.js');
    await fs.writeFile(greenworksjsPath, greenworksFileRemoteContent, 'utf8');

    logger.info('Copying files');
    const toCopy = [
      path.join(sdkPath, 'redistributable_bin', 'linux64', 'libsteam_api.so'),
      path.join(sdkPath, 'redistributable_bin', 'osx32', 'libsteam_api.dylib'),
      path.join(sdkPath, 'redistributable_bin', 'win64', 'steam_api64.dll'),
      path.join(sdkPath, 'redistributable_bin', 'steam_api.dll'),
      path.join(sdkPath, 'public', 'steam', 'lib', 'linux64', 'libsdkencryptedappticket.so'),
      path.join(sdkPath, 'public', 'steam', 'lib', 'osx32', 'libsdkencryptedappticket.dylib'),
      path.join(sdkPath, 'public', 'steam', 'lib', 'win32', 'sdkencryptedappticket.dll'),
      path.join(sdkPath, 'public', 'steam', 'lib', 'win64', 'sdkencryptedappticket64.dll'),
    ];

    for (let i = 0; i < toCopy.length; i += 1) {
      const file = toCopy[i];
      try {
        if (!fs.existsSync(path.join(greenworksLibsDir, path.basename(file)))) {
          await fs.copy(file, greenworksLibsDir);
        }
      } catch (e) {
        logger.error(`There was an error copying ${file}, are you sure steam sdk path is valid ?`);
        return {
          error: '',
          sources: [],
        };
      }
    }

    if (localGreenworksPath) {
      const localLibPath = path.join(localGreenworksPath, 'node_modules', 'greenworks', 'lib');
      if (fs.existsSync(localLibPath)) {
        logger.info(`Using local build from ${localLibPath}`);
        const files = fs.readdirSync(localLibPath);
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          if (path.extname(file) === '.node') {
            await fs.copy(path.join(localLibPath, file), greenworksLibsDir);
          }
        }
      } else {
        logger.error(`${localLibPath} can not be found!`);
        return {
          error: '',
          sources: [],
        };
      }
    } else {
      const electronVersion: string = electron;
      // eslint-disable-next-line
      const abi: string = abis.getAbi(electronVersion, 'electron');

      if (electronVersion[0] === '4' && abi === '64') {
        logger.error(`Electron version ${electronVersion} found - aborting due to known ABI issue
More information about this issue can be found at https://github.com/lgeiger/node-abi/issues/54
Please, avoid using electron from 4.0.0 to 4.0.3`);
        throw new Error('Invalid Electron version');
      }

      logger.info('Fetching prebuilds');
      let release = 'latest';
      if (prebuildsVersion) {
        release = `tags/v${prebuildsVersion}`;
      }
      const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/${release}`;
      const content = await request<GHRelease>(url);

      const platforms = ['darwin', 'win32', 'linux'];
      const platformsX = ['osx', 'win', 'linux'];

      const downloads = [];

      logger.info('Downloading prebuilds');
      for (let i = 0; i < platforms.length; i += 1) {
        const platform = platforms[i];

        const assetName = `greenworks-electron-v${abi}-${platform}-x64.node`;
        const asset = content.assets.find((a) => a.name === assetName);
        if (!asset) {
          logger.error(`The target ${assetName} seems not to be available
          currently. Build it yourself, or change Electron version.`);
          return {
            error: '',
            sources: [],
          };
        }
        const res = asset.browser_download_url;

        downloads.push(downloadFile(res, path.join(greenworksLibsDir, `greenworks-${platformsX[i]}64.node`), logger));
      }

      try {
        await Promise.all(downloads);
      } catch (e) {
        logger.error(e);
      }

      await fs.remove(path.join(greenworksLibsDir, 'obj.target'));
    }

    logger.success('Initialization done!');
    return {
      sources: [workingDirectory],
    };
  },
} as Task;
