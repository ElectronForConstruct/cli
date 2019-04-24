const Console = require('../utils/console');

const logger = Console.normal('new');
const iaLogger = Console.interactive('new');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'new',
  description: 'Bootstrap a new project',
  cli: [
    {
      name: 'name',
      shortcut: 'n',
    },
    {
      name: 'git',
      boolean: true,
      default: true,
    },
    {
      name: 'preview',
      boolean: true,
      default: true,
    },
  ],

  async run(args, config) {
    if (config.isProject) {
      logger.warn('This project is already configured');
      return;
    }

    if (!args.name) {
      logger.error('A name is required in order to create a project');
      return;
    }

    const fs = require('fs');
    const path = require('path');
    const shelljs = require('shelljs');
    const downloadPreview = require('../utils/downloadPreview');

    const fullPath = path.join(process.cwd(), args.name);
    if (fs.existsSync(fullPath)) {
      logger.warn('This path already exist!');
      return;
    }

    iaLogger.info('Bootstrapping project...');

    shelljs.mkdir('-p', fullPath);
    shelljs.cp('-R', [
      path.join(__dirname, '../', 'new-project-template', '*'), // regular files
      path.join(__dirname, '../', 'new-project-template', '.*'), // hidden files (.gitignore, etc)
    ], fullPath);

    if (!args.git && fs.existsSync(path.join(fullPath, '.gitignore'))) {
      fs.unlinkSync(path.join(fullPath, '.gitignore'));
    }

    if (args.preview) {
      await downloadPreview(fullPath);
    }

    iaLogger.success('Bootstrapping done.');
    logger.info(`You can now go to your project by using "cd ${args.name}"`);
  },
};
