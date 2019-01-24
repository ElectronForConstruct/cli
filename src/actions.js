import { prompt } from 'enquirer';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import opn from 'opn';
import os from 'os';
import ghdownload from 'github-download';
import request from 'request';
import ora from 'ora';
import chalk from 'chalk';
import process from 'process';
import isDev from './isDev';

export const installDeps = () => {
  const spinner = ora('Installing dependencies...').start();

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
  });
};

export const startPreview = (url) => {
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

export const previewC2 = async () => {
  console.log('To preview a Construct 2 project, please follow instructions here: https://github.com/ElectronForConstruct/template');
};

export const previewC3 = async () => {
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

export const getPathToConfig = () => path.join(process.cwd(), 'config.json');

export const showHelp = () => {
  console.log('To get help, please refer to this link: https://github.com/ElectronForConstruct/template');
};

export const reportAnIssue = () => {
  const msg = `
Configuration:
- OS: ${os.platform()}
- Arch: ${os.arch()}

Steps to reproduce: 
- 
  `.trim();

  opn(`https://github.com/ElectronForConstruct/preview-script/issues/new?body=${encodeURI(msg)}`);
};

const generateElectronProject = async () => {
  const dir = process.cwd();

  const questions = {
    type: 'input',
    name: 'name',
    message: 'What is the name of your project?',
    initial: () => 'MyGame',
    format: name => path.join(dir, name),
    validate: (name) => {
      if (fs.existsSync(path.join(dir, name))) {
        return 'This path already exist!';
      }
      return true;
    },
  };

  let answers = {};
  try {
    answers = await prompt(questions);
    const fullPath = path.join(dir, answers.name);

    const spinner = ora('Downloading template...').start();

    ghdownload({
      user: 'ElectronForConstruct',
      repo: 'template',
      ref: 'develop',
    }, fullPath)
      .on('dir', (/* dir */) => {
        // onsole.log('dir', dir);
      })
      .on('file', (/* file */) => {
        // console.log('file', file);
      })
      // only emitted if Github API limit is reached and the zip file is downloaded
      .on('zip', (/* zipUrl */) => {
        // console.log('zipUrl', zipUrl);
      })
      .on('error', (err) => {
        console.error('err', err);
      })
      .on('end', () => {
        const isWin = process.platform === 'win32';
        const isLinux = process.platform === 'linux';
        const isMac = process.platform === 'darwin';

        let name;
        if (isWin) {
          name = 'preview-win.exe';
        } else if (isLinux) {
          name = 'preview-linux';
        } else if (isMac) {
          name = 'preview-macos';
        } else {
          throw new Error('Unknown OS');
        }

        request({
          url: 'https://api.github.com/repos/ElectronForConstruct/preview-script/releases/latest',
          headers: {
            'User-Agent': 'ElectronForContruct',
          },
        }, (error, response, body) => {
          const json = JSON.parse(body);
          /* console.log(json);
                              console.log(json.assets);
                              console.log(json.assets.find(asset => asset.name === name)); */
          const assetUrl = json.assets
            .find(asset => asset.name === name).browser_download_url;
          request(assetUrl)
            .pipe(fs.createWriteStream(
              path.join(fullPath, `preview${isWin ? '.exe' : ''}`),
            ))
            .on('finish', () => {
              spinner.succeed('Downloaded');
              console.log(`\nYou can now go to your project by using "cd ${answers.name}" and install dependencies with either "npm install" or "yarn install"\n`);
            });
        });
      });
  } catch (e) {
    console.log('Aborted');
  }
};

export const showMenu = async () => {
  if (isDev) process.chdir('MyGame');

  let dependenciesInstalled = true;
  let isCorrectElectronFolder = false;

  // check node_modules
  if (!fs.existsSync('./node_modules')) {
    dependenciesInstalled = false;
    console.log(
      `
${chalk.yellow('Oopsie! Dependencies are not installed!')}
Please install them using ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}

`,
    );
  }

  // check configuration

  if (
    fs.existsSync('./config.js')
    && fs.existsSync('./preview.exe')
  ) {
    isCorrectElectronFolder = true;
  }

  const choices = [];
  // if the folder is a valid supported electron project
  if (isCorrectElectronFolder) {
    // and deps are installed
    if (dependenciesInstalled) {
      choices.push(
        {
          message: 'Preview C2',
          name: 0,
        },
        {
          message: 'Preview C3',
          name: 1,
        },
      );
    } else {
      // but deps not installed
      choices.push(
        {
          message: 'Install dependencies',
          name: 6,
        },
      );
    }
  } else {
    // if the folder i not a upported electron project
    choices.push(
      {
        message: 'Generate a new Electron project',
        name: 2,
      },
    );
  }
  choices.push(
    {
      role: 'separator',
      value: chalk.dim('────'),
    },
    {
      message: 'View help',
      name: 3,
    },
    {
      message: 'Report an issue',
      name: 4,
    },
    {
      message: 'Exit',
      name: 5,
    },
  );

  const questions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices,
  };

  let answers = {};
  try {
    answers = await prompt(questions);
    if (isDev) {
      console.log(answers);
    }

    // override type if was not previously set

    switch (answers.action) {
      case 0:
        previewC2();
        break;

      case 1:
        previewC3();
        break;

      case 2:
        generateElectronProject();
        break;

      case 3:
        showHelp();
        break;

      case 4:
        reportAnIssue();
        break;

      case 5:
        process.exit(0);
        break;

      case 6:
        installDeps();
        break;

      default:
        console.log('unexpected case');
        break;
    }
  } catch (e) {
    console.log('Aborted');
  }
};
