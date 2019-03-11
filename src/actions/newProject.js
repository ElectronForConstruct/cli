const chalk = require('chalk');
const { prompt } = require('enquirer');
const fs = require('fs');
const ora = require('ora');
const path = require('path');
const downloadTemplate = require('../utils/downloadTemplate');
const Command = require('../classes/Command');
const installDeps = require('../utils/installAllDeps');

module.exports = class extends Command {
  constructor() {
    super('new', 'Create a new project', 'n');
    this.setCategory('Toolchain');
  }

  isVisible() {
    return !this.config.isElectron;
  }

  async run(originPath) {
    const { settings } = this;
    const { branch } = settings.project;

    let answers = {};
    const dir = process.cwd();
    let name = '';
    let useGit = false;
    let install = true;

    try {
      if (!originPath) {
        const questions = [
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
          {
            type: 'confirm',
            name: 'useGit',
            message: 'Use Git',
            initial: false,
          },
          {
            type: 'confirm',
            name: 'install',
            message: 'Automatically install dependencies',
            initial: true,
          },
        ];
        answers = await prompt(questions);
        // todo clean here v
        ({
          name,
          useGit,
          install,
        } = answers);
      }

      // eslint-disable-next-line
      if (!name) name = originPath;

      const fullPath = path.join(dir, name);

      const spinner = ora(`Downloading template from ${branch} channel...`).start();
      await downloadTemplate(fullPath, branch);
      if (!useGit && fs.existsSync(path.join(fullPath, '.gitignore'))) {
        fs.unlinkSync(path.join(fullPath, '.gitignore'));
      }
      spinner.succeed('Downloaded');

      if (install) {
        process.chdir(fullPath);
        await installDeps(settings);
      } else if (!originPath) console.log(`\nYou can now go to your project by using ${chalk.underline(`cd ${name}`)} and install dependencies with either ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`);
    } catch (e) {
      console.error('Aborted:', e);
    }
  }
};
