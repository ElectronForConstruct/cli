const ora = require('ora');
const installAllDeps = require('../utils/installAllDeps');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('install-deps', 'Install dependencies', 'd');
    this.setCategory('Utility');
  }

  show() {
    return this.config.isElectron;
  }

  async run() {
    const { settings } = this.config;

    const spinner = ora('Installing dependencies... This may take a while, relax and take a coffee').start();
    await installAllDeps(settings)
    spinner.succeed('Dependencies successfully installed');
  }
};
