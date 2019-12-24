// eslint-disable-next-line
// @ts-ignore
import openInEditor from 'launch-editor';

import * as path from 'path';
import * as fs from 'fs';
import { CynModule } from '../definitions';

const command: CynModule = {
  name: 'config',
  description: 'Open a link where you can donate to support this app',
  cli: [
    {
      name: 'global',
      shortcut: 'g',
      default: false,
    },
  ],

  async run(args) {
    const configPath = path.join(process.cwd(), `config.${args.profile ? `${args.profile}.js` : 'js'}`);

    if (!fs.existsSync(configPath)) {
      this.logger.error(`It seems that "${path.basename(configPath)}" doesn't exist!`);
      return false;
    }

    this.logger.log(`Opening ${configPath}`);

    try {
      openInEditor(configPath);
    } catch (e) {
      this.logger.error(e);
      return false;
    }

    return true;
  },
};
export default command;
