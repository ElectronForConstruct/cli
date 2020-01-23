import path from 'path';
import fs from 'fs-extra';
import {CynModule, Settings} from '../models';
import downloadPreview from '../utils/downloadPreview';
import {TEMPLATE_DIRECTORY} from '../constants';
import mri from "mri";

export const hooks = [];
export const command = class New extends CynModule {
  name = 'new';
  description = 'Bootstrap a new project';

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
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

    await fs.ensureDir(fullPath);
    await fs.copy(`${TEMPLATE_DIRECTORY}`, fullPath);

    if (args.type === 'yaml') {
      // TODO
    }

    await downloadPreview(fullPath);

    this.iLogger.success('Bootstrapping done.');
    this.logger.info(`You can now go to your project by using "cd ${name}"`);
    return true;
  };
};
