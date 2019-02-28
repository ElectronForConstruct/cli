import { prompt } from 'enquirer';
import opn from 'opn';
import pkg from '../../package.json';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('help', 'Help', 'h');
  }

  show() {
    return true;
  }

  async run() {
    console.log('Version: ', pkg.version);
    console.log('To get help, please refer to this link: https://electronforconstruct.armaldio.xyz');

    const answers = await prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Open browser ?',
      },
    ]);
    if (answers.confirm) {
      opn('https://electronforconstruct.armaldio.xyz');
    }
  }
}
