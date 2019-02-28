import Command from '../Command';

export default class extends Command {
  constructor() {
    super('quit', 'Quit', 'q');
  }

  show() {
    return true;
  }

  async run() {
    // do nothing
  }
}
