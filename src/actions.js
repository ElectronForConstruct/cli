import { prompt } from 'enquirer';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import zip from 'zip-a-folder';
import opn from 'opn';
import os from 'os';
import ghdownload from 'github-download';
import request from 'request';
import ora from 'ora';
import chalk from 'chalk';
import process from 'process';
import * as eb from 'electron-builder';
import shelljs from 'shelljs';
import box from './box';
import pkg from '../package.json';
import isDev from './isDev';

const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
// const electron = (process.platform === 'win32' ? 'electron.cmd' : 'npm');

const installDeps = async () => new Promise((resolve) => {
  const spinner = ora('Installing dependencies... This may take a while, relax and take a coffee').start();

  const npmstart = spawn(npm, [ 'install', '--no-package-lock' ]); /* , {
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

const startPreview = url => new Promise((resolve) => {
  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

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
    resolve(true);
  });
});

const previewAppFolder = async () => {
  await startPreview();
};

const previewC2 = async () => {
  opn('https://electronforconstruct.armaldio.xyz/intro/using-the-module.html#previewing-a-construct-2-project');
};

const previewC3 = async () => {
  console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
  console.log('Go to the preview menu, hit "Remote preview" and paste the link that appear here');
  const answers = await prompt([
    {
      type    : 'input',
      name    : 'url',
      message : 'Enter the Construct 3 preview URL: ',
      validate: (url) => {
        const regex = /https:\/\/preview\.construct\.net\/#.{8}$/;
        if (url.match(regex)) {
          return true;
        }
        return `Invalid URL: ${url}`;
      },
    },
  ]);
  await startPreview(answers.url);
};

const showHelp = async () => {
  console.log('Version: ', pkg.version);
  console.log('To get help, please refer to this link: https://electronforconstruct.armaldio.xyz');

  const answers = await prompt([
    {
      type   : 'confirm',
      name   : 'confirm',
      message: 'Open browser ?',
    },
  ]);
  if (answers.confirm) {
    opn('https://electronforconstruct.armaldio.xyz');
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
    url    : 'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
  }, (error, response, body) => {
    const json     = JSON.parse(body);
    const assetUrl = json.assets
                         .find(asset => asset.name === 'preview.exe').browser_download_url;
    request(assetUrl).pipe(fs.createWriteStream(
      path.join(fullPath, 'preview.exe'),
    )).on('finish', () => {
      resolve(true);
    });
  });
});

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

const downloadTemplate = async (fullPath, branch) => {
  await downloadRepo('ElectronForConstruct', 'template', branch, `${fullPath}.tmp`);
  if (!fs.existsSync(fullPath))
    shelljs.mkdir(fullPath);
  shelljs.cp('-R', `${fullPath}.tmp/template/*`, fullPath);
  shelljs.rm('-rf', `${fullPath}.tmp`);

  if (process.platform === 'win32') await downloadPreview(fullPath);
};

const generateElectronProject = async (originPath) => {
  let config = {};
  // eslint-disable-next-line
  if (fs.existsSync(path.join(process.cwd(), 'config.js'))) config = require(path.join(process.cwd(), 'config.js'));

  const branch = config?.project?.branch || 'master';

  let answers = {};
  const dir   = process.cwd();
  let name    = '';

  try {
    if (!originPath) {
      const questions = {
        type    : 'input',
        name    : 'name',
        message : 'What is the name of your project?',
        initial : () => 'MyGame',
        format  : typedName => path.join(dir, typedName),
        validate: (typedName) => {
          if (fs.existsSync(path.join(dir, typedName))) {
            return 'This path already exist!';
          }
          return true;
        },
      };
      answers         = await prompt(questions);
      ({
        name,
      } = answers);
    }

    // eslint-disable-next-line
    if (!name) name = originPath;

    const fullPath = path.join(dir, name);

    const spinner = ora(`Downloading template from ${branch} channel...`).start();
    await downloadTemplate(fullPath, branch);
    spinner.succeed('Downloaded');

    if (!originPath) console.log(`\nYou can now go to your project by using ${chalk.underline(`cd ${name}`)} and install dependencies with either ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`);
  } catch (e) {
    console.error('Aborted:', e);
  }
};

const updateApp = async () => {
  console.log('Preparing ...');

  const fullDirectoryPath = process.cwd();
  const folderName        = path.basename(process.cwd());

  shelljs.cd('..');

  // remove node_modules
  shelljs.rm('-rf', path.join(fullDirectoryPath, 'node_modules'));

  // move files to bak dir
  shelljs.cp('-r', fullDirectoryPath, `${fullDirectoryPath}.bak`);

  // make a zip backup
  await zip.zip(fullDirectoryPath, `${fullDirectoryPath}-${Date.now().toString()}.zip`);

  // remove original folder
  shelljs.rm('-rf', `${fullDirectoryPath}/*`);

  // download new template
  // eslint-disable-next-line
  const config = require(path.join(`${fullDirectoryPath}.bak`, 'config.js'));
  await generateElectronProject(folderName);

  // move new template files to old directory

  shelljs.cp('-R', [
    path.join(`${fullDirectoryPath}.bak`, 'config.js'),
    path.join(`${fullDirectoryPath}.bak`, 'app'),
  ], fullDirectoryPath);

  // install deps

  // cleanup
  shelljs.rm('-rf', `${fullDirectoryPath}.bak`);

  // profit
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
      const result = await eb.build(config.build);
      console.log(result);
    } catch (e) {
      console.log('There was an error building your project:', e);
    }
  }
};

// eslint-disable-next-line
export const showMenu = async () => {
  if (isDev && fs.existsSync('MyGame')) process.chdir('MyGame');

  let dependenciesInstalled   = true;
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
      /* *** Check new version of template *** */
      // Nothing to check against actually
      // eslint-disable-next-line
      /* const config = require(path.join(process.cwd(), 'config.js'));
      const p = () => new Promise((resolve) => {
        request.get({
          url: `https://raw.githubusercontent.com/ElectronForConstruct/template/${config.project.branch}/package.json`,
          json: true,
        }, (e, r, pkg) => {
          resolve(pkg);
        });
      });

      const pkgjson = await p();
      console.log(pkgjson);
      */

      choices.push(
        {
          name    : 'Preview with',
          disabled: '>',
          choices : [
            {
              name : 'Construct 2',
              value: 0,
            },
            {
              name : 'Construct 3',
              value: 1,
            },
            {
              name : 'Exported project',
              value: 10,
            },
          ],
        },
        {
          name : 'Build',
          value: 9,
        },
        {
          message: 'Update app',
          name   : 7,
        },
      );
    } else {
      // but deps not installed
      choices.push(
        {
          name    : 'Dependencies must be installed first!',
          value   : 6,
          disabled: true,
        },
      );
    }
  } else {
    // if the folder i not a upported electron project
    choices.push(
      {
        name : 'Generate a new Electron project',
        value: 2,
      },
    );
  }

  choices.push(
    {
      role : 'separator',
      value: chalk.dim('────'),
    },
    {
      name : 'View help',
      value: 3,
    },
    {
      name : 'Report an issue',
      value: 4,
    },
    {
      name : 'Donate',
      value: 8,
    },
    {
      name : 'Exit',
      value: 5,
    },
  );

  const questions = {
    type   : 'select',
    name   : 'action',
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
      [ 0, previewC2 ],
      [ 1, previewC3 ],
      [ 2, generateElectronProject ],
      [ 3, showHelp ],
      [ 4, reportAnIssue ],
      [ 5, exit ],
      [ 6, installDeps ],
      [ 7, updateApp ],
      [ 8, () => opn('https://armaldio.xyz/#/donations') ],
      [ 9, build ],
      [ 10, previewAppFolder ],
    ];

    console.log(); // just crlf

    await actions.find(a => a[ 0 ] === answers.action.value)[ 1 ]();
  } catch (e) {
    console.log('Aborted:', e);
  }

  console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
};
