const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const request = require('request');
const ora = require('ora');
const Command = require('../classes/Command');

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
        json,
      }, (e, r, content) => {
        if (e) reject(e);
        resolve(content);
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

    const { settings } = this;

    // TODO `!${mixed.greenworks.sdkPath}/!**`,

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

    shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'linux64', 'libsteam_api.so'), greenworksLibsDir);

    shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'osx32', 'libsteam_api.dylib'), greenworksLibsDir);

    shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'win64', 'steam_api64.dll'), greenworksLibsDir);
    shelljs.cp(path.join(sdkPath, 'redistributable_bin', 'steam_api.dll'), greenworksLibsDir);

    // - - -

    shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'linux64', 'libsdkencryptedappticket.so'), greenworksLibsDir);

    shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'osx32', 'libsdkencryptedappticket.dylib'), greenworksLibsDir);

    shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'win32', 'sdkencryptedappticket.dll'), greenworksLibsDir);
    shelljs.cp(path.join(sdkPath, 'public', 'steam', 'lib', 'win64', 'sdkencryptedappticket64.dll'), greenworksLibsDir);

    // download prebuilt or use the one built many if useLocalBuild set to true
    const localBuildPath = path.join('node_modules', 'greenworks', 'lib');
    if (greenworks.useLocalBuild && fs.existsSync(localBuildPath)) {
      const files = fs.readdirSync(localBuildPath);
      files.forEach((file) => {
        if (path.extname(file) === '.node') shelljs.cp(path.join(localBuildPath, file), greenworksLibsDir);
      });
    } else {
      // TODO download
      console.log('TODO :/');
    }

    spinner.succeed('Greenworks initialization done!');
  }
};
