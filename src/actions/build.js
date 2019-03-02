import * as eb from 'electron-builder';
import fs from 'fs';
import path from 'path';
import process from 'process';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('build', 'Build', 'b');
    this.setCategory('Toolchain');
  }

  async run() {
    if (
      !fs.existsSync(path.join(process.cwd(), 'app', 'data.js'))
      && !fs.existsSync(path.join(process.cwd(), 'app', 'data.json'))) {
      console.warn('It seems that there isn\'t any Construct game inside the app folder. Did you forgot to export ?');
    } else {
      try {
        // eslint-disable-next-line
        const result = await eb.build({ config: this.config.settings.build });
        console.log(result);
      } catch (e) {
        console.log('There was an error building your project:', e);
      }
    }
  }
}
