const opn = require('opn');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('donate', 'Donate');
  }

  show() {
    return true;
  }

  async run() {
    opn('https://armaldio.xyz/#/donations');
  }
};
