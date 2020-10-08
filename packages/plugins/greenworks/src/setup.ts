import { createScopedLogger } from '@cyn/utils';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import abis from 'modules-abi';
import fs from 'fs-extra';
import got, { Progress } from 'got';

const logger = createScopedLogger('greenworks', {
  interactive: false,
});

export interface Asset {
    name: string
    // eslint-disable-next-line camelcase
    browser_download_url: string
  }
  export interface GHRelease {
    assets: Asset[]
  }

interface Config {
  steamId: number;
  sdkPath: string;
  localGreenworksPath: string | null;
  prebuildsVersion: string;
  electron: string;
}

const config: Config = {
  steamId: 480,
  sdkPath: 'steam_sdk',
  localGreenworksPath: null,
  prebuildsVersion: 'latest',
  electron: '10.1.2'
};

export default {
  description: 'Description',
  name: 'greenworks/setup',
  config,
  request<T>(url: string): Promise<T> {
    return got(url, {
      headers: {
        'User-Agent': 'Cyn',
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }).json();
  },

  downloadFile(url: string, mypath: string): Promise<string> {
    const output = createScopedLogger('greenworks', {
      interactive: true,
    });

    return new Promise((resolve) => {
      const stream = got.stream(url);
      stream
        .on('downloadProgress', (progress: Progress): void => {
          output.log(`Downloading "${mypath}" (${Math.round(progress.percent * 100)}%)`);
        })
        .pipe(fs.createWriteStream(
          mypath,
        ))
        .on('finish', () => {
          resolve(mypath);
        });
    });
  },
  async run({
    taskSettings,
    workingDirectory
  } : { workingDirectory: string, taskSettings: Config }): Promise<any> {
    console.log('taskSettings', taskSettings)
    console.log('workingDirectory', workingDirectory)

    const {
      steamId,
      sdkPath,
      localGreenworksPath,
      prebuildsVersion,
      electron
    } = taskSettings;

    const steamSDKPath = path.resolve(sdkPath)
    console.log('steamSDKPath', steamSDKPath)

    const greenworksDir = path.join(workingDirectory, 'greenworks');
    const greenworksLibsDir = path.join(greenworksDir, 'lib');

    if (!steamSDKPath) {
      logger.error('Please specify a path to your steam sdk in the configuration file');
      return {
        error: '',
        sources: [],
      };
    }

    if (!fs.existsSync(steamSDKPath)) {
      logger.error(`${steamSDKPath} does not exist! Please, specify a valid path to your steam sdk.`);
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
    await this.downloadFile(
      'https://raw.githubusercontent.com/greenheartgames/greenworks/master/greenworks.js',
      greenworksjsPath
      );

    logger.info('Copying files');
    const toCopy = [
      path.join(steamSDKPath, 'redistributable_bin', 'linux64', 'libsteam_api.so'),
      path.join(steamSDKPath, 'redistributable_bin', 'osx32', 'libsteam_api.dylib'),
      path.join(steamSDKPath, 'redistributable_bin', 'win64', 'steam_api64.dll'),
      path.join(steamSDKPath, 'redistributable_bin', 'steam_api.dll'),
      path.join(steamSDKPath, 'public', 'steam', 'lib', 'linux64', 'libsdkencryptedappticket.so'),
      path.join(steamSDKPath, 'public', 'steam', 'lib', 'osx32', 'libsdkencryptedappticket.dylib'),
      path.join(steamSDKPath, 'public', 'steam', 'lib', 'win32', 'sdkencryptedappticket.dll'),
      path.join(steamSDKPath, 'public', 'steam', 'lib', 'win64', 'sdkencryptedappticket64.dll'),
    ];

    for (let i = 0; i < toCopy.length; i += 1) {
      const file = toCopy[i];
      try {
        if (!fs.existsSync(path.join(greenworksLibsDir, path.basename(file)))) {
          await fs.copy(file, path.join(greenworksLibsDir, path.basename(file)));
        }
      } catch (e) {
        logger.error(`There was an error copying "${file}", are you sure steam sdk path is valid ?`);
        logger.error(e);
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
      const abi: string = await abis.getAbi(electronVersion, 'electron');

      if (electronVersion[0] === '4' && abi === '64') {
        logger.error(`Electron version ${electronVersion} found - aborting due to known ABI issue
More information about this issue can be found at https://github.com/lgeiger/node-abi/issues/54
Please, avoid using electron from 4.0.0 to 4.0.3`);
        throw new Error('Invalid Electron version');
      }

      logger.info('Fetching prebuilds');
      let release = 'latest';
      if (prebuildsVersion !== 'latest') {
        release = `tags/v${prebuildsVersion}`;
      }
      const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/${release}`;
      console.log('url', url)
      const content = await this.request<GHRelease>(url);

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

        downloads.push(this.downloadFile(res, path.join(greenworksLibsDir, `greenworks-${platformsX[i]}64.node`)));
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
}