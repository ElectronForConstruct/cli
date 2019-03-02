const ora = require('ora');
const install = require('install-packages');
const Command = require('../Command');

module.exports = class extends Command {
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
};
