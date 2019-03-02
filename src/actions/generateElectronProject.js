import chalk from 'chalk';
import { prompt } from 'enquirer';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import downloadTemplate from '../utils/downloadTemplate';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('new-project', 'Create a new project', 'n');
    this.setCategory('Toolchain');
  }

  show() {
    return !this.config.isElectron;
  }

  async run(originPath) {
    const { branch } = this.config.settings.project;

    let answers = {};
    const dir = process.cwd();
    let name = '';

    try {
      if (!originPath) {
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
  }
}
