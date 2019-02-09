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
import got from 'got';
import * as eb from 'electron-builder';
import replaceInFiles from 'replace-in-files';
import shelljs from 'shelljs';
import box from './box';
import pkg from '../package.json';
import isDev from './isDev';

const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
// const electron = (process.platform === 'win32' ? 'electron.cmd' : 'npm');

const installDeps = async () => new Promise((resolve) => {
  const spinner = ora('Installing dependencies... This may take a while, relax and take a coffe').start();

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

  let command;
  if (url) {
    command = `${npm} run start -- ${url}`;
  } else {
    command = `${npm} run start`;
  }

  const npmstart = exec(command, {
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

const previewAppFolder = async () => {
  startPreview();
};

const previewC2 = async () => {
  opn('https://electronforconstruct.netlify.com/intro/using-the-module.html#previewing-a-construct-2-project');
};

const previewC3 = async () => {
  console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
  console.log('Go to the preview menu, hit "Remote preview" and paste the link that appear here');
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

const showHelp = async () => {
  console.log('Version: ', pkg.version);
  console.log('To get help, please refer to this link: https://electronforconstruct.netlify.com');

  const answers = await prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Open browser ?',
    },
  ]);
  if (answers.confirm) {
    opn('https://electronforconstruct.netlify.com');
  }
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

const replaceContent = async (fullPath, from, to) => {
  const options = {
    files: path.join(fullPath, './**'),
    from: new RegExp(from, 'g'),
    to,
    optionsForFiles: { // default
      ignore: [
        '**/node_modules/**',
      ],
    },
  };

  try {
    const {
      changedFiles,
      countOfMatchesByPaths,
      replaceInFilesOptions,
    } = await replaceInFiles(options);
    console.log('Modified files:', changedFiles);
    console.log('Count of matches by paths:', countOfMatchesByPaths);
    console.log('was called with:', replaceInFilesOptions);
  } catch (error) {
    console.log('Error occurred:', error);
  }
};

const downloadRepo = (user, repo, branch, outputDir) => new Promise((resolve, reject) => {
  ghdownload({
    user,
    repo,
    ref: branch,
  }, outputDir)
    .on('error', (err) => {
      reject(err);
    })
    .on('end', () => {
      resolve(outputDir);
    });
});

const downloadTemplate = async (fullPath, branch = 'master') => {
  await downloadRepo('ElectronForConstruct', 'template', branch, `${fullPath}.tmp`);
  shelljs.cp('-R', `${fullPath}.tmp/template`, fullPath);
  shelljs.rm('-rf', `${fullPath}.tmp`);

  if (process.platform === 'win32') await downloadPreview(fullPath);

  await replaceContent(fullPath, '{{ name }}', 'MonNom');
  // await replaceContent(fullPath, '{{ description }}', 'MaDescription');
};

const generateElectronProject = async (projectName = null) => {
  let answers = {};
  const dir = process.cwd();
  let name = projectName;
  let branch = 'master';
  let spinner;

  try {
    // if I already have a folder name, eg update, no need to ask again for it
    if (!projectName) {
      let branches = [];
      try {
        branches = await got('https://api.github.com/repos/electronforconstruct/template/branches', { json: true });
      } catch (e) {
        console.log(e);
      }
      const choices = branches.body.map(b => ({
        message: b.name === 'master' ? chalk.green(`${b.name} (recommended)`) : chalk.yellow(b.name),
        name: b.name,
        value: b.name,
      }));

      const questions = [
        {
          type: 'select',
          name: 'branch',
          message: 'What channel do you want to use ?',
          initial: 'master',
          choices,
          result() {
            return this.focused.value;
          },
        },
        {
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
        },
      ];

      answers = await prompt(questions);
      ({
        name,
        branch,
      } = answers);
    }

    const fullPath = path.join(dir, name);

    spinner = ora(`Downloading template from ${branch} channel...`).start();
    await downloadTemplate(fullPath, branch);
    spinner.succeed('Downloaded');

    if (!projectName) console.log(`\nYou can now go to your project by using ${chalk.underline(`cd ${name}`)} and install dependencies with either ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`);
  } catch (e) {
    spinner.fail(`Aborted: ${e}`);
  }
};

const updateApp = async () => {
  tmp.setGracefulCleanup();
  shelljs.set('-v');

  const fullDirectoryPath = process.cwd();
  const folderName = path.basename(process.cwd());

  shelljs.cd('..');

  // create a temporary directory for saving files
  const tmpobj = tmp.dirSync();
  console.log('Creating temp directory: ', tmpobj.name);

  // move files to it (config.js + app folder)
  shelljs.cp('-r', path.join(fullDirectoryPath, 'config.js'), path.join(fullDirectoryPath, 'app'), tmpobj.name);
  console.log(`Moving config.js + app folder to ${tmpobj.name}`);

  // make a backup
  // shelljs.mv(`${fullDirectoryPath}/**`, `${fullDirectoryPath}_backup`);
  await Zip.zip(fullDirectoryPath, `${fullDirectoryPath}.zip`);
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

const exit = () => {
};

const build = async () => {
  if (
    !fs.existsSync(path.join(process.cwd(), 'app', 'data.js'))
    && !fs.existsSync(path.join(process.cwd(), 'app', 'data.json'))) {
    console.warn('It seems that there ins\'t any Construct game inside the app folder. Did you forgot to export ?');
  } else {
    try {
      // eslint-disable-next-line
      const config = require(path.join(process.cwd(), 'config.js'));
      const result = await eb.build(config.buil);
      console.log(result);
    } catch (e) {
      console.log('There was an error building your project:', e);
    }
  }
};

// eslint-disable-next-line
export const showMenu = async () => {
  if (isDev && fs.existsSync('MyGame')) process.chdir('MyGame');

  let dependenciesInstalled = true;
  let isCorrectElectronFolder = false;

  // check configuration

  if (fs.existsSync('./config.js')) {
    isCorrectElectronFolder = true;

    // check node_modules
    if (!fs.existsSync('./node_modules')) {
      dependenciesInstalled = false;
      console.log(box(`${chalk.yellow('Whoops! Dependencies are not installed!')}
Please install them using ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`));
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
            {
              name: 'Exported project',
              value: 10,
            },
          ],
        },
        {
          name: 'Build',
          value: 9,
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
          name: 'Dependencies must be installed first!',
          value: 6,
          disabled: true,
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
      [9, build],
      [10, previewAppFolder],
    ];

    console.log(); // just crlf

    await actions.find(a => a[0] === answers.action.value)[1]();
  } catch (e) {
    console.log('Aborted:', e);
  }

  console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
};
