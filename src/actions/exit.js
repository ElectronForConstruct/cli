const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('quit', 'Quit', 'q');
  }

  show() {
    return true;
  }

  async run() {
    // do nothing
  }
};
