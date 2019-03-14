const chalk = require('chalk');
const { prompt } = require('enquirer');
const fs = require('fs');
const ora = require('ora');
const path = require('path');
const { Command } = require('@efc/core');
const downloadTemplate = require('../utils/downloadTemplate');
const downloadPreview = require('../utils/downloadPreview');
const installDeps = require('../utils/installAllDeps');

module.exports = class extends Command {
  constructor() {
    super('new', 'Create a new project', 'n');
    this.setCategory('Toolchain');
  }

  isVisible() {
    return !this.config.isProject;
  }

  async run() {
    const { settings } = this;
    const { branch } = settings.project;

    let answers = {};
    const dir = process.cwd();
    try {
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
          name: 'preview',
          message: 'Include standalone preview tool',
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

      const {
        name,
        useGit,
        install,
        preview,
      } = answers;

      const fullPath = path.join(dir, name);

      const spinner = ora(`Downloading template from ${branch} channel...`).start();
      await downloadTemplate(fullPath, branch);
      if (!useGit && fs.existsSync(path.join(fullPath, '.gitignore'))) {
        fs.unlinkSync(path.join(fullPath, '.gitignore'));
      }
      if (preview) await downloadPreview(fullPath);
      spinner.succeed('Downloaded');

      let stringEnd = '';
      if (install) {
        process.chdir(fullPath);
        await installDeps(settings);
      } else {
        stringEnd = `and install dependencies with ${chalk.underline('efc config')}`;
      }
      console.log(`\nYou can now go to your project by using ${chalk.underline(`cd ${name}`)} ${stringEnd}`);
    } catch (e) {
      console.error('Aborted:', e);
    }
  }
};
