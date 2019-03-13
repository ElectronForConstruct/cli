const { Command } = require('@efc/core');

module.exports = class extends Command {
  constructor() {
    super('debug', 'Debug');
  }

  isVisible() {
    return true;
  }

  async run() {
    console.log(this.settings);
  }
};
