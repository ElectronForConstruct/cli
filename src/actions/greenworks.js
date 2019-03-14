const shelljs = require('shelljs');
const path = require('path');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
// const os = require('os');
const { Command } = require('@efc/core');
const nodeAbi = require('node-abi');
const fs = require('fs');
const request = require('request');
const ora = require('ora');
const { USER_PACKAGE_JSON } = require('../utils/ComonPaths');

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
        if (e) reject(e);
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

  async onPreBuild() {
    await this.run();
  }

  async run() {
    const spinner = ora('Initializing greenworks ...').start();

    const pkg = require(USER_PACKAGE_JSON);

    const { settings } = this;

    if (!settings.greenworks) {
      spinner.fail('"greenworks" key not found. You must specify your greenworks settings under this key.');
      return;
    }

    const { greenworks } = settings;

    const greenworksDir = path.join(process.cwd(), 'greenworks');
    const greenworksLibsDir = path.join(process.cwd(), 'greenworks', 'lib');

    // Create greenworks directory
    if (!fs.existsSync(greenworksDir)) shelljs.mkdir(greenworksDir);
    if (!fs.existsSync(greenworksLibsDir)) shelljs.mkdir(greenworksLibsDir);

    // Generate steamId
    if (!greenworks.steamId) {
      spinner.fail('Please specify a steam game id in the configuration file');
      return;
    }

    const { steamId } = greenworks;
    fs.writeFileSync(path.join(process.cwd(), 'steam_appid.txt'), steamId, 'utf8');

    // Download latest greenworks init
    const greenworksFileRemoteContent = await this.githubFileDownload('https://raw.githubusercontent.com/greenheartgames/greenworks/master/greenworks.js');
    fs.writeFileSync(path.join(greenworksDir, 'greenworks.js'), greenworksFileRemoteContent, 'utf8');

    // download prebuilt or use the one built many if useLocalBuild set to true
    const localBuildPath = path.join('node_modules', 'greenworks', 'lib');
    if (greenworks.useLocalBuild && fs.existsSync(localBuildPath)) {
      if (!greenworks.sdkPath) {
        spinner.fail('Please specify a path to your steam sdk in the configuration file');
        return;
      }

      // copy needed files
      const { sdkPath } = greenworks;

      if (!fs.existsSync(sdkPath)) {
        spinner.fail(`${sdkPath} does not exist!`);
        return;
      }

      try {
        shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'linux64', 'libsteam_api.so'), greenworksLibsDir);

        shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'osx32', 'libsteam_api.dylib'), greenworksLibsDir);

        shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'win64', 'steam_api64.dll'), greenworksLibsDir);
        shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'steam_api.dll'), greenworksLibsDir);

        // - - -

        shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'linux64', 'libsdkencryptedappticket.so'), greenworksLibsDir);

        shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'osx32', 'libsdkencryptedappticket.dylib'), greenworksLibsDir);

        shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'win32', 'sdkencryptedappticket.dll'), greenworksLibsDir);
        shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'win64', 'sdkencryptedappticket64.dll'), greenworksLibsDir);
      } catch (e) {
        console.error('There was an error copying files, are you sure steam sdk path is valid ?');
      }

      const files = fs.readdirSync(localBuildPath);
      files.forEach((file) => {
        if (path.extname(file) === '.node') shelljs.cp(path.join(localBuildPath, file), greenworksLibsDir);
      });
    } else {
      const url = 'https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/latest';
      const content = await this.githubFileDownload(url, true);

      const version = pkg.devDependencies.electron.replace('^', '');
      const abi = nodeAbi.getAbi(version, 'electron');
      // const platform = os.platform();

      const platforms = ['darwin', 'win32', 'linux'];

      for (let i = 0; i < platforms.length; i += 1) {
        const p = platforms[i];

        const res = content.assets.find(asset => asset.name === `greenworks-v0.14.0-electron-v${abi}-${p}-x64.tar.gz`).browser_download_url;

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
      }
      shelljs.rm('-rf', path.join(greenworksLibsDir, 'obj.target'));
    }

    spinner.succeed('Greenworks initialization done!');
  }
};
