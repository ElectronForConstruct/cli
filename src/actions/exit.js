const { Command } = require('@efc/core');

module.exports = class extends Command {
  constructor() {
    super('quit', 'Quit', 'q');
  }

  isVisible() {
    return true;
  }

  async run() {
    // do nothing
  }
};
