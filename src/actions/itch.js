const chalk = require('chalk');
const Command = require('../classes/Command');

module.exports = class extends Command {
  constructor() {
    super('itch', 'Publish to Itch.io', 'i');
    this.setCategory('Publish');
  }

  isVisible() {
    return false;
  }

  async run() {
    console.log(chalk.blue('Publishing to itch...'));
  }
};
