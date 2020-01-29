import path from 'path';
import fs from 'fs-extra';
import mri from 'mri';
import { CynModule, Settings } from '../models';
import downloadPreview from '../utils/downloadPreview';
import { TEMPLATE_DIRECTORY } from '../constants';

export const hooks = [];
export const command = class New extends CynModule {
  name = 'new';

  description = 'Bootstrap a new project';

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
    const logger = this.createLogger();
    const iLogger = this.createLogger(true);

    if (settings.isProject) {
      logger.warn('This project is already configured');
      return false;
    }

    if (!args._[1]) {
      logger.error('A name is required in order to create a project');
      return false;
    }
    const name = args._[1];

    const fullPath = path.join(process.cwd(), name);
    if (fs.existsSync(fullPath)) {
      logger.warn('This path already exist!');
      return false;
    }

    iLogger.info('Generating project, please wait...');

    await fs.ensureDir(fullPath);
    await fs.copy(`${TEMPLATE_DIRECTORY}`, fullPath);

    if (args.type === 'yaml') {
      // TODO
    }

    await downloadPreview(fullPath);

    iLogger.success('Bootstrapping done.');
    logger.info(`You can now go to your project by using "cd ${name}"`);
    return true;
  };
};
