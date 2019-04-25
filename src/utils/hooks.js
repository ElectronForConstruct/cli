const logger = require('../utils/console').normal('hooks');

module.exports = {
  async preBuild(modules, args, settings, tempDir) {
    logger.info('Running pre-build operations...');

    // Prebuild hooks
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      if (typeof module.onPreBuild === 'function') {
        // eslint-disable-next-line
        logger.start(`Executing ${module.name}`);
        const done = await module.onPreBuild(args, settings, tempDir);
        if (!done) {
          logger.fatal('Task aborted! Some task did not complete succesfully');
          return;
        }
      }
    }
    logger.success('pre-build operations done.');
  },

  async postBuild(modules, args, settings, folders) {
    // postBuild hook
    logger.info('Running post-build operations...');

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      for (let j = 0; j < modules.length; j += 1) {
        const module = modules[j];
        if (typeof module.onPostBuild === 'function') {
          const done = await module.onPostBuild(args, settings, folder);
          if (!done) {
            logger.fatal('Task aborted! Some task did not complete succesfully');
            return;
          }
        }
      }
    }
    logger.success('post-build operations done.');
  },
};
