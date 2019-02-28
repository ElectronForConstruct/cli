import { spawn } from 'child_process';
import ora from 'ora';
import { npm } from '../utils';
import Command from '../Command';
import install from 'install-packages';

export default class extends Command {
  constructor() {
    super('install-deps', 'Install dependencies', 'd');
    this.setCategory('Utility');
  }

  show() {
    return !this.config.isReady && this.config.isElectron;
  }

  async run() {
    const spinner = ora('Installing dependencies... This may take a while, relax and take a coffee').start();
    await install();
    spinner.succeed('Dependencies successfully installed');
  }
}
