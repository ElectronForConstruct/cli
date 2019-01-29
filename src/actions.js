import { prompt } from 'enquirer';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import zip from 'zip-a-folder';
import opn from 'opn';
import rimraf from 'rimraf';
import os from 'os';
import ghdownload from 'github-download';
import request from 'request';
import ora from 'ora';
import chalk from 'chalk';
import process from 'process';
import tmp from 'tmp';
import shelljs from 'shelljs';
import pkg from '../package.json';
import isDev from './isDev';

const installDeps = async () => new Promise((resolve) => {
  const spinner = ora('Installing dependencies... This may take a while, relax and take a coffe').start();

  const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
  const npmstart = spawn(npm, ['install', '--no-package-lock']); /* , {
    stdio: 'inherit',
    cwd: process.cwd(),
    detached: true,
  }); */

  npmstart.stdout.on('data', (data) => {
    spinner.text = data.toString();
  });

  npmstart.stderr.on('data', (data) => {
    spinner.warn(`Error: ${data.toString()}`).start();
  });

  npmstart.on('exit', (/* code */) => {
    spinner.succeed('Dependencies successfully installed');
    resolve(true);
  });
});

const startPreview = (url) => {
  console.log(`Starting preview on "${url}"`);

  const npmstart = exec(`npm run start -- ${url}`, {
    cwd: process.cwd(),
  });

  npmstart.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  npmstart.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString()}`);
  });

  npmstart.on('exit', (code) => {
    console.log(`Electron exited: ${code.toString()}`);
  });
};

const previewC2 = async () => {
  console.log('To preview a Construct 2 project, please follow instructions here: https://github.com/ElectronForConstruct/template');
};

const previewC3 = async () => {
  console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
  console.log('Then, go to the preview menu and hit "Remote preview" and paste the link that appear here');
  const answers = await prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter the Construct 3 preview URL: ',
      validate: (url) => {
        const regex = /https:\/\/preview\.construct\.net\/#.{8}$/;
        if (url.match(regex)) {
          return true;
        }
        return `Invalid URL: ${url}`;
      },
    },
  ]);
  startPreview(answers.url);
};

const showHelp = () => {
  console.log("Version: ", pkg.version);
  console.log('To get help, please refer to this link: https://github.com/ElectronForConstruct/template');
};

const reportAnIssue = () => {
  const msg = `
Configuration:
- OS: ${os.platform()}
- Arch: ${os.arch()}

Steps to reproduce: 
- 
  `.trim();

  opn(`https://github.com/ElectronForConstruct/preview/issues/new?body=${encodeURI(msg)}`);
};

const downloadPreview = async fullPath => new Promise((resolve) => {
  request({
    url: 'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
  }, (error, response, body) => {
    const json = JSON.parse(body);
    const assetUrl = json.assets
      .find(asset => asset.name === 'preview.exe').browser_download_url;
    request(assetUrl)
      .pipe(fs.createWriteStream(
        path.join(fullPath, 'preview.exe'),
      ))
      .on('finish', () => {
        resolve(true);
      });
  });
});

const downloadTemplate = async (fullPath, branch = 'develop') => new Promise((resolve) => {
  ghdownload({
    user: 'ElectronForConstruct',
    repo: 'template',
    ref: branch,
  }, fullPath)
    .on('error', (err) => {
      console.error('err', err);
    })
    .on('end', async () => {
      if (process.platform === 'win32') await downloadPreview(fullPath);
      resolve(true);
    });
});

const generateElectronProject = async (projectName = null) => {
  let answers = {};
  const dir = process.cwd();
  let name = projectName;

  try {
    // if I already have a folder name, eg update, no need to ask again for it
    if (!projectName) {
      const questions = {
        type: 'input',
        name: 'name',
        message: 'What is the name of your project?',
        initial: () => 'MyGame',
        format: typedName => path.join(dir, typedName),
        validate: (typedName) => {
          if (fs.existsSync(path.join(dir, typedName))) {
            return 'This path already exist!';
          }
          return true;
        },
      };

      answers = await prompt(questions);
      ({ name } = answers);
    }

    const fullPath = path.join(dir, name);

    const spinner = ora('Downloading template...').start();
    await downloadTemplate(fullPath);
    spinner.succeed('Downloaded');

    if (!projectName) console.log(`\nYou can now go to your project by using "cd ${name}" and install dependencies with either "npm install" or "yarn install"\n`);
  } catch (e) {
    console.log('Aborted');
  }
};

const updateApp = async () => {
  tmp.setGracefulCleanup();
  shelljs.set('-v');

  const folderName = path.basename(process.cwd());
  const fullDirectoryPath = path.join(process.cwd());

  shelljs.cd('..');

  // create a temporary directory for saving files
  const tmpobj = tmp.dirSync();
  console.log('Creating temp directory: ', tmpobj.name);

  // move files to it (config.js + app folder)
  shelljs.cp('-r', path.join(fullDirectoryPath, 'config.js'), path.join(fullDirectoryPath, 'app'), tmpobj.name);
  console.log(`Moving config.js + app folder to ${tmpobj.name}`);

  // make a backup
  // shelljs.mv(`${fullDirectoryPath}/**`, `${fullDirectoryPath}_backup`);
  await zip.zip(fullDirectoryPath, `${fullDirectoryPath}.zip`);
  console.log(`Making a backup to ${fullDirectoryPath}.zip`);

  rimraf(fullDirectoryPath, (a, b, c) => {
    console.log(a, b, c);
  });
  console.log(`Removing ${folderName}`);

  // remove folder
  // shelljs.rm('-r', fullDirectoryPath);

  // download new template
  // await generateElectronProject(folderName);

  // move new template files to old directory

  // install deps

  // move saved files in temp to old directory

  // profit
  // tmpobj.removeCallback();
};

const exit = () => process.exit(0);

// eslint-disable-next-line
export const showMenu = async () => {
  if (isDev && fs.existsSync('MyGame')) process.chdir('MyGame');

  let dependenciesInstalled = true;
  let isCorrectElectronFolder = false;

  // check configuration

  if (
    fs.existsSync('./config.js')
    && fs.existsSync('./preview.exe')
  ) {
    isCorrectElectronFolder = true;

    // check node_modules
    if (!fs.existsSync('./node_modules')) {
      dependenciesInstalled = false;
      console.log(
        `
${chalk.yellow('Whoops! Dependencies are not installed!')}
Please install them using ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}

`,
      );
    }
  }

  const choices = [];
  // if the folder is a valid supported electron project
  if (isCorrectElectronFolder) {
    // and deps are installed
    if (dependenciesInstalled) {
      choices.push(
        {
          name: 'Preview with',
          disabled: '>',
          choices: [
            {
              name: 'Construct 2',
              value: 0,
            },
            {
              name: 'Construct 3',
              value: 1,
            },
          ],
        },
        /* {
          message: 'Update app',
          name: 7,
        }, */
      );
    } else {
      // but deps not installed
      choices.push(
        {
          name: 'Install dependencies',
          value: 6,
        },
      );
    }
  } else {
    // if the folder i not a upported electron project
    choices.push(
      {
        name: 'Generate a new Electron project',
        value: 2,
      },
    );
  }
  choices.push(
    {
      role: 'separator',
      value: chalk.dim('────'),
    },
    {
      name: 'View help',
      value: 3,
    },
    {
      name: 'Report an issue',
      value: 4,
    },
    {
      name: 'Donate',
      value: 8,
    },
    {
      name: 'Exit',
      value: 5,
    },
  );

  const questions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices,
    result() {
      return this.focused;
    },
  };

  let answers = {};
  try {
    answers = await prompt(questions);

    const actions = [
      [0, previewC2],
      [1, previewC3],
      [2, generateElectronProject],
      [3, showHelp],
      [4, reportAnIssue],
      [5, exit],
      [6, installDeps],
      [7, updateApp],
      [8, () => opn('https://armaldio.xyz/#/donations')],
    ];

    await actions.find(a => a[0] === answers.action.value)[1]();
  } catch (e) {
    console.log('Aborted:', e);
  }
  console.log('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥');
};
