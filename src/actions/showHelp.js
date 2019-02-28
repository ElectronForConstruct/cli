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
    console.log(`Version: ${pkg.version}\n`);

    const options = this.modules.map(module => `  ${module.category} - ${module.name}: ${module.id} ${module.shortcut ? `(${module.shortcut})` : ''}`);

    console.log(`
Usage: 
  
  efc [id]
  
  id: the id of the command you want to execute directly
      
Available modules:
  Category - name: id [(shortcut)]
  
${options.join('\n')}          
    `);

    const answers = await prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Get more help in the browser ?',
      },
    ]);
    if (answers.confirm) {
      opn('https://electronforconstruct.armaldio.xyz');
    }
  }
}
