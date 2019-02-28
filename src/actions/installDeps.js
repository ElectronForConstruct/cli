import { spawn } from 'child_process';
import ora from 'ora';
import { npm } from '../utils';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('install-deps', 'Install dependencies', 'd');
    this.setCategory('Utility');
  }

  show() {
    return !this.config.isReady;
  }

  async run() {
    return new Promise((resolve) => {
      const spinner = ora('Installing dependencies... This may take a while, relax and take a coffee').start();

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
  }
}
