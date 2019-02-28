import opn from 'opn';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('preview-c2', 'Construct 2', '2');
    this.setCategory('Preview');
  }

  async run() {
    opn('https://electronforconstruct.armaldio.xyz/intro/using-the-module.html#previewing-a-construct-2-project');
  }
}
