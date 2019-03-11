const ora = require('ora');
const installAllDeps = require('../utils/installAllDeps');
const Command = require('../classes/Command');

module.exports = class extends Command {
  constructor() {
    super('config', 'Update configuration', 'c');
    this.setCategory('Utility');
  }

  isVisible() {
    return this.config.isElectron;
  }

  async run() {
    const { settings } = this;

    const spinner = ora('Installing dependencies... This may take a while, relax and take a coffee').start();
    await installAllDeps(settings);
    spinner.succeed('Dependencies successfully installed');
  }
};
