const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const got = require('got');
const Console = require('../utils/console');

const logger = Console.normal('itch');

const downloadFile = async (url, p) => new Promise((resolve) => {
  got.stream(url)
    .pipe(fs.createWriteStream(
      p,
    ))
    .on('finish', () => {
      resolve(p);
    });
});

const extractZip = async (from, to) => new Promise((resolve, reject) => {
  const extract = require('extract-zip');
  extract(from, { dir: to }, (err) => {
    if (err) {
      reject(err);
    }
    resolve(to);
  });
});

const exe = async (command, args) => {
  logger.log('Publishing to itch...');
  return new Promise((resolve) => {
    const npmstart = exec(command, args);

    npmstart.stdout.on('data', (data) => {
      try {
        const json = JSON.parse(data.toString());

        if (json.type === 'log') {
          logger.log(json.message);
        } else if (json.type === 'progress') {
          logger.log(`Uploading ${Math.round(json.percentage)}%`);
        }
        // logger.log(data.toString());
      } catch (e) {
        //
      }
    });

    npmstart.stderr.on('data', (data) => {
      logger.error(data.toString());
    });

    npmstart.on('exit', (code) => {
      resolve(code.toString());
    });
  });
};

const publish = async (args, settings, out) => {
  const enquirer = require('enquirer');
  const shelljs = require('shelljs');

  const itchFolderPath = path.join(process.cwd(), 'itch');
  const butler = path.join(itchFolderPath, `butler${os.platform() === 'win32' ? '.exe' : ''}`);

  // download butler
  if (!fs.existsSync(itchFolderPath) || !fs.existsSync(butler)) {
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

    if (!fs.existsSync(itchFolderPath)) {
      shelljs.mkdir(path.join(process.cwd(), 'itch'));
    }

    const sourceZip = await downloadFile(linkToDownload, path.join(itchFolderPath, 'itch.zip'));
    await extractZip(sourceZip, itchFolderPath);

    shelljs.rm(sourceZip);
  }

  let outDir = out;
  if (!path.isAbsolute(outDir)) {
    outDir = path.join(process.cwd(), out);
  }

  shelljs.chmod('+x', butler);

  await exe(`${butler} upgrade -j`);
  await exe(`${butler} login`);


  let defaultPrompt = '';
  if (outDir.includes('win')) {
    defaultPrompt = 'windows-stable';
  }
  if (outDir.includes('darwin')) {
    defaultPrompt = 'osx-stable';
  }
  if (outDir.includes('linux')) {
    defaultPrompt = 'linux-stable';
  }

  const answers = await enquirer.prompt({
    type: 'input',
    name: 'channel',
    initial: defaultPrompt,
    message: `[${outDir}] What tag do you want to give to this version`,
  });

  const { project } = settings.itch;
  if (!project) {
    logger.error('You must specify a project in the itch configuration!');
    return;
  }

  await exe(`${butler} push ${outDir} ${project}:${answers.channel} -j`);
};

/**
 * @type EFCModule
 */
module.exports = {
  name: 'itch',
  description: 'Publish to Itch.io',
  config: {
    project: null, // 'armaldio/test'
  },

  async onPostBuild(args, settings, out) {
    try {
      await publish(args, settings, out);
    } catch (e) {
      logger.error('Publishing to itch failed!', e);
    }
  },

  async run() {
    logger.info('This plugin run automatically after a build');
  },
};
