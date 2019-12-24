import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import downloadPreview from '../utils/downloadPreview';
import { CynModule } from '../definitions';

const command: CynModule = {
  name: 'new',
  description: 'Bootstrap a new project',

  async run(args, config) {
    if (config.isProject) {
      this.logger.warn('This project is already configured');
      return false;
    }

    if (!args._[1]) {
      this.logger.error('A name is required in order to create a project');
      return false;
    }
    const name = args._[1];

    const fullPath = path.join(process.cwd(), name);
    if (fs.existsSync(fullPath)) {
      this.logger.warn('This path already exist!');
      return false;
    }

    this.iLogger.info('Generating project, please wait...');

    shelljs.mkdir('-p', fullPath);
    const templatePath = path.join(__dirname, '../', 'new-project-template');
    shelljs.cp('-R', [`${templatePath}/*`, `${templatePath}/.*`], fullPath);

    await downloadPreview(fullPath);

    this.iLogger.success('Bootstrapping done.');
    this.logger.info(`You can now go to your project by using "cd ${name}"`);
    return true;
  },
};

export default command;
