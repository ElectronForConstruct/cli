const { exec } = require('child_process');
const request = require('request');
const p = require('phin');
const fs = require('fs');
const os = require('os');
const ora = require('ora/index');
const enquirer = require('enquirer');
const shelljs = require('shelljs');
const path = require('path');
const extract = require('extract-zip');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('itch', 'Publish to Itch.io');
  }

  async downloadFile(url, p) {
    return new Promise((resolve) => {
      p({
        url,
        stream: true,
      }).pipe(fs.createWriteStream(
        p,
      )).on('finish', () => {
        resolve(p);
      });
    });
  }

  async extract(from, to) {
    return new Promise((resolve, reject) => {
      extract(from, { dir: to }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(to);
      });
    });
  }

  async exe(command, args) {
    let spinner = ora('Publishing to itch...').start();
    return new Promise((resolve) => {
      const npmstart = exec(command, args);

      npmstart.stdout.on('data', (data) => {
        try {
          const json = JSON.parse(data.toString());

          if (json.type === 'log') {
            spinner = spinner.info(json.message).start();
          } else if (json.type === 'progress') {
            spinner.text = `Uploading ${Math.round(json.percentage)}%`;
          }
          // console.log(data.toString());
        } catch (e) {
          //
        }
      });

      npmstart.stderr.on('data', (data) => {
        spinner = spinner.fail(data.toString());
      });

      npmstart.on('exit', (code) => {
        spinner.stop();
        resolve(code.toString());
      });
    });
  }

  async publish() {
    const itchFolderPath = path.join(process.cwd(), 'itch');
    if (!fs.existsSync(itchFolderPath)) {
      const platform = os.platform();
      const arch = os.arch();
      const links = [
        // get         remote
        ['darwin-x64', 'darwin-amd64'],
        ['linux-x64', 'linux-amd64'],
        ['linux-ia32', 'linux-386'],
        ['win32-x64', 'windows-amd64'],
        ['win32-ia32', 'windows-386'],
      ];

      const butlerPlatform = links.find(link => link[0] === `${platform}-${arch}`)[1];
      const linkToDownload = `https://broth.itch.ovh/butler/${butlerPlatform}/LATEST/archive/default`;

      shelljs.mkdir(path.join(process.cwd(), 'itch'));

      const sourceZip = await this.downloadFile(linkToDownload, path.join(itchFolderPath, 'itch.zip'));
      await this.extract(sourceZip, itchFolderPath);

      shelljs.rm(sourceZip);
    }

    const { build } = this.settings;
    const { out } = build;
    let outDir = out;
    if (!path.isAbsolute(outDir)) {
      outDir = path.join(process.cwd(), out);
    }

    const butler = path.join(itchFolderPath, `butler${os.platform() === 'win32' ? '.exe' : ''}`);
    shelljs.chmod('+x', butler);

    await this.exe(`${butler} upgrade -j`);

    const folders = fs.readdirSync(outDir);

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      let defaultPrompt = '';
      if (folder.includes('win')) {
        defaultPrompt = 'windows-stable';
      }
      if (folder.includes('darwin')) {
        defaultPrompt = 'osx-stable';
      }
      if (folder.includes('linux')) {
        defaultPrompt = 'linux-stable';
      }

      const answers = await enquirer.prompt({
        type: 'input',
        name: 'channel',
        initial: defaultPrompt,
        message: `[${folder}] What tag do you want to give to this version`,
      });

      const folderFullPath = path.join(outDir, folder);
      await this.exe(`${butler} push ${folderFullPath} armaldio/test:${answers.channel} -j`);
    }
  }

  async onPostBuild() {
    await this.publish();
  }

  async run() {
    await this.publish();
  }
};
