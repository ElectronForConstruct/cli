const path = require('path');
const nodeAbi = require('node-abi');
const fs = require('fs');
const Console = require('../utils/console');

const log = Console.interactive('greenworks');

const githubFileDownload = async (url, json = false) => new Promise(async (resolve, reject) => {
  const got = require('got');
  let file = '';
  try {
    file = await got({
      url,
      headers: {
        'User-Agent': 'ElectronForContruct',
      },
      parse: json ? 'none' : 'json',
    });
  } catch (e) {
    reject(e);
  }
  resolve(file);
});

const downloadFile = async (url, mypath) => new Promise((resolve) => {
  const got = require('got');
  got({
    url,
    stream: true,
  }).pipe(fs.createWriteStream(
    mypath,
  )).on('finish', () => {
    resolve(got);
  });
});

/**
 * @type EFCModule
 */
module.exports = {
  name: 'greenworks',
  description: 'Configure greenworks',

  config: {
    steamId: 480,
    sdkPath: 'steam_sdk',
    localGreenworksPath: null,
    forceClean: false,
  },

  /**
   * Command
   */

  async onPreBuild(args, settings, tmpdir) {
    const shelljs = require('shelljs');

    const done = await this.run(args, settings);
    if (!done) {
      return done;
    }

    shelljs.mkdir('-p', path.join(tmpdir, 'greenworks'));
    if (fs.existsSync(path.join(process.cwd(), 'greenworks'))) {
      shelljs.cp('-R', path.join(process.cwd(), 'greenworks', '*'), path.join(tmpdir, 'greenworks'));
    }
    return true;
  },

  async onPostBuild(args, settings, out) {
    const shelljs = require('shelljs');

    const steamAppIdTxt = path.join(process.cwd(), 'greenworks', 'steam_appid.txt');
    shelljs.cp(steamAppIdTxt, path.join(out, 'steam_appid.txt'));
    return true;
  },

  async run(args, settings) {
    const shelljs = require('shelljs');

    const decompress = require('decompress');
    const decompressTargz = require('decompress-targz');

    const greenworksDir = path.join(process.cwd(), 'greenworks');
    const greenworksLibsDir = path.join(process.cwd(), 'greenworks', 'lib');

    if (fs.existsSync(greenworksDir) && !settings.greenworks.forceClean) {
      log.info('"greenworks" folder detected. Skipping.');
      return true;
    }

    if (!settings.greenworks) {
      log.error('"greenworks" key not found. You must specify your greenworks settings under this key.');
      return false;
    }

    // download prebuilt or use the one built many if localGreenworksPath set to true
    if (!settings.greenworks.sdkPath) {
      log.error('Please specify a path to your steam sdk in the configuration file');
      return false;
    }

    // copy needed files
    const { sdkPath } = settings.greenworks;

    if (!fs.existsSync(sdkPath)) {
      log.error(`${sdkPath} does not exist! Please, specify a valid path to your steam sdk.`);
      return false;
    }

    // -----------------------///

    // Create greenworks directory
    log.info('Generating required folders');

    if (!fs.existsSync(greenworksDir)) {
      shelljs.mkdir(greenworksDir);
    }
    if (!fs.existsSync(greenworksLibsDir)) {
      shelljs.mkdir(greenworksLibsDir);
    }

    // Generate steamId
    if (!settings.greenworks.steamId) {
      log.error('Please specify a steam game id in the configuration file');
      return false;
    }

    const { steamId, localGreenworksPath, forceClean } = settings.greenworks;


    log.info('Downloading greenworks');

    const steamAppIdPath = path.join(greenworksDir, 'steam_appid.txt');
    fs.writeFileSync(steamAppIdPath, steamId, 'utf8');

    // Download latest greenworks init
    const greenworksjsPath = path.join(greenworksDir, 'greenworks.js');
    const greenworksFileRemoteContent = await githubFileDownload('https://raw.githubusercontent.com/greenheartgames/greenworks/master/greenworks.js');
    fs.writeFileSync(greenworksjsPath, greenworksFileRemoteContent, 'utf8');

    log.info('Copying files');
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

    toCopy.forEach((file) => {
      try {
        if (!fs.existsSync(path.join(greenworksLibsDir, path.basename(file))) || forceClean) {
          shelljs.cp(file, greenworksLibsDir);
        }
      } catch (e) {
        log.error(`There was an error copying ${file}, are you sure steam sdk path is valid ?`);
      }
    });

    if (localGreenworksPath) {
      const localLibPath = path.join(localGreenworksPath, 'node_modules', 'greenworks', 'lib');
      if (fs.existsSync(localLibPath)) {
        log.info(`Using local build from ${localLibPath}`);
        const files = fs.readdirSync(localLibPath);
        files.forEach((file) => {
          if (path.extname(file) === '.node') {
            shelljs.cp(path.join(localLibPath, file), greenworksLibsDir);
          }
        });
      } else {
        log.error(`${localLibPath} can not be found!`);
      }
    } else {
      log.info('Downloading prebuilds');
      const version = settings.electron;

      const url = 'https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/latest';
      const content = await githubFileDownload(url, true);

      const abi = nodeAbi.getAbi(version, 'electron');
      // const platform = os.platform();

      const platforms = ['darwin', 'win32', 'linux'];

      for (let i = 0; i < platforms.length; i += 1) {
        const platform = platforms[i];

        const assetName = `greenworks-v0.14.0-electron-v${abi}-${platform}-x64.tar.gz`;
        try {
          const res = content.assets.find(asset => asset.name === assetName).browser_download_url;

          // TODO use proper temp directory
          const tempFolder = path.join(process.cwd(), 'temp');
          shelljs.mkdir('-p', tempFolder);
          const tarFile = path.join(tempFolder, 'file.tar.gz');
          await downloadFile(res, tarFile);
          await decompress(tarFile, tempFolder, {
            plugins: [
              decompressTargz(),
            ],
          });
          shelljs.cp('-R', path.join(tempFolder, 'build', 'Release/*'), greenworksLibsDir);
          shelljs.rm('-rf', tempFolder);
        } catch (e) {
          // TODO fix error here
          log.error(`The target ${assetName} seems not to be available currently. Build it yourself, or change Electron version.`);
        }
      }
      shelljs.rm('-rf', path.join(greenworksLibsDir, 'obj.target'));
    }

    log.success('Initialization done!');
    return true;
  },
};
