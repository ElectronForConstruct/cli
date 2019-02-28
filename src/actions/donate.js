import opn from 'opn';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('donate', 'Donate');
  }

  show() {
    return true;
  }

  async run() {
    opn('https://armaldio.xyz/#/donations');
  }
}
