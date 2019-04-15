module.exports = {
  name: 'new',
  description: 'Bootstrap a new project',
  usage: 'new [ [ -n name ] [ -g ] [ -p ]',
  cli: {
    alias: {
      n: 'name',
      g: 'git',
      p: 'preview',
    },
  },

  async run() {
    if (this.config.isProject) {
      console.log('This project is already configured');
      return;
    }

    const chalk = require('chalk');
    const { prompt } = require('enquirer');
    const ora = require('ora');
    const fs = require('fs');
    const path = require('path');
    const shelljs = require('shelljs');
    const downloadPreview = require('../utils/downloadPreview');

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
      ];
      answers = await prompt(questions);

      const {
        name,
        useGit,
        preview,
      } = answers;

      const fullPath = path.join(dir, name);

      const spinner = ora('Bootstrapping project...').start();

      shelljs.mkdir('-p', fullPath);
      shelljs.cp('-R', path.join(__dirname, '../../', 'new-project-template', '*'), fullPath);

      if (!useGit && fs.existsSync(path.join(fullPath, '.gitignore'))) {
        fs.unlinkSync(path.join(fullPath, '.gitignore'));
      }

      if (preview) {
        await downloadPreview(fullPath);
      }

      spinner.succeed('Downloaded');
      console.log(`\nYou can now go to your project by using ${chalk.underline(`cd ${name}`)}`);
    } catch (e) {
      console.error('Aborted:', e);
    }
  },
};
