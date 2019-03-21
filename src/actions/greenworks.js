const shelljs = require('shelljs');
const path = require('path');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const enquirer = require('enquirer');
const nodeAbi = require('node-abi');
const fs = require('fs');
const request = require('request');
const semver = require('semver');
const { Command } = require('../core');

module.exports = class extends Command {
  constructor() {
    super('greenworks', 'Configure greenworks', 'g');

    this.setCategory('Publish');
  }

  /**
   * Utils
   */

  githubFileDownload(url, json = false) {
    return new Promise((resolve, reject) => {
      request.get({
        url,
        headers: {
          'User-Agent': 'ElectronForContruct',
        },
        json,
      }, (e, r, content) => {
        if (e) {
          reject(e);
        }
        resolve(content);
      });
    });
  }

  async downloadFile(url, p) {
    return new Promise((resolve) => {
      request(url).pipe(fs.createWriteStream(
        p,
      )).on('finish', () => {
        resolve(p);
      });
    });
  }

  /**
   * Command
   */

  async onPreBuild(tmpdir) {
    await this.run();
    shelljs.mkdir('-p', path.join(tmpdir, 'greenworks'));
    if (fs.existsSync(path.join(process.cwd(), 'greenworks'))) {
      shelljs.cp('-R', path.join(process.cwd(), 'greenworks', '*'), path.join(tmpdir, 'greenworks'));
    }
  }

  async onPostBuild(out) {
    console.log(out);
    const folders = fs.readdirSync(out);

    const steamAppIdTxt = path.join(process.cwd(), 'greenworks', 'steam_appid.txt');
    folders.forEach((folder) => {
      shelljs.cp(steamAppIdTxt, path.join(out, folder, 'steam_appid.txt'));
    });
  }

  async run() {
    console.log('Initializing greenworks ...');

    const { settings } = this;

    if (!settings.greenworks) {
      console.error('"greenworks" key not found. You must specify your greenworks settings under this key.');
      return;
    }

    const { greenworks, electron } = settings;

    const greenworksDir = path.join(process.cwd(), 'greenworks');
    const greenworksLibsDir = path.join(process.cwd(), 'greenworks', 'lib');

    if (fs.existsSync(greenworksDir) && !greenworks.forceClean) {
      console.info('"greenworks" folder detected. Skipping.');
      return;
    }

    // Create greenworks directory
    if (!fs.existsSync(greenworksDir)) {
      shelljs.mkdir(greenworksDir);
    }
    if (!fs.existsSync(greenworksLibsDir)) {
      shelljs.mkdir(greenworksLibsDir);
    }

    // Generate steamId
    if (!greenworks.steamId) {
      console.error('Please specify a steam game id in the configuration file');
      return;
    }

    const { steamId, localGreenworksPath, forceClean } = greenworks;

    const steamAppIdPath = path.join(greenworksDir, 'steam_appid.txt');
    fs.writeFileSync(steamAppIdPath, steamId, 'utf8');

    // Download latest greenworks init
    const greenworksjsPath = path.join(greenworksDir, 'greenworks.js');
    const greenworksFileRemoteContent = await this.githubFileDownload('https://raw.githubusercontent.com/greenheartgames/greenworks/master/greenworks.js');
    fs.writeFileSync(greenworksjsPath, greenworksFileRemoteContent, 'utf8');

    // download prebuilt or use the one built many if localGreenworksPath set to true
    if (!greenworks.sdkPath) {
      console.error('Please specify a path to your steam sdk in the configuration file');
      return;
    }

    // copy needed files
    const { sdkPath } = greenworks;

    if (!fs.existsSync(sdkPath)) {
      console.error(`${sdkPath} does not exist! Please, specify a valid path to your steam sdk.`);
      return;
    }

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
        console.error(`There was an error copying ${file}, are you sure steam sdk path is valid ?`);
      }
    });

    if (localGreenworksPath) {
      const localLibPath = path.join(localGreenworksPath, 'node_modules', 'greenworks', 'lib');
      if (fs.existsSync(localLibPath)) {
        console.log(`Using local build from ${localLibPath}`);
        const files = fs.readdirSync(localLibPath);
        files.forEach((file) => {
          if (path.extname(file) === '.node') {
            shelljs.cp(path.join(localLibPath, file), greenworksLibsDir);
          }
        });
      } else {
        console.error(`${localLibPath} can not be found!`);
      }
    } else {
      console.log('Using prebuilds');
      const version = electron;

      if (semver.satisfies(version, '4.0.0 - 4.1.0')) {
        console.log('Some people have reported errors using prebuilds of electron from 4.0.0 to 4.1.0.');
        const answers = await enquirer.prompt({
          type: 'confirm',
          message: 'Are ou sure you want to continue',
          name: 'continue',
        });

        if (!answers.continue) {
          shelljs.rm('-rf', greenworksDir);
          return;
        }
      }

      const url = 'https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/latest';
      const content = await this.githubFileDownload(url, true);

      const abi = nodeAbi.getAbi(version, 'electron');
      // const platform = os.platform();

      const platforms = ['darwin', 'win32', 'linux'];

      for (let i = 0; i < platforms.length; i += 1) {
        const p = platforms[i];

        const assetName = `greenworks-v0.14.0-electron-v${abi}-${p}-x64.tar.gz`;
        try {
          const res = content.assets.find(asset => asset.name === assetName).browser_download_url;

          // TODO use proper temp directory
          const tempFolder = path.join(process.cwd(), 'temp');
          shelljs.mkdir('-p', tempFolder);
          const tarFile = path.join(tempFolder, 'file.tar.gz');
          await this.downloadFile(res, tarFile);
          await decompress(tarFile, tempFolder, {
            plugins: [
              decompressTargz(),
            ],
          });
          shelljs.cp('-R', path.join(tempFolder, 'build', 'Release/*'), greenworksLibsDir);
          shelljs.rm('-rf', tempFolder);
        } catch (e) {
          console.error(`The target ${assetName} seems not to be available currently. Build it yourself, or change Electron version.`);
        }
      }
      shelljs.rm('-rf', path.join(greenworksLibsDir, 'obj.target'));
    }

    console.log('Greenworks initialization done!');
  }
};
