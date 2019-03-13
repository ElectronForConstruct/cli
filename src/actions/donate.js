const opn = require('opn');
const { Command } = require('@efc/core');

module.exports = class extends Command {
  constructor() {
    super('donate', 'Donate');
  }

  isVisible() {
    return true;
  }

  async run() {
    opn('https://armaldio.xyz/#/donations');
  }
};
