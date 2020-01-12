import mri from 'mri';
import { CynModule } from '../models';
import { createNormalLogger } from './console';

const logger = createNormalLogger('hooks');

async function preBuild(
  modules: CynModule[],
  args: mri.Argv,
  settings: any,
  tempDir: string,
): Promise<void> {
  logger.info('Running pre-build operations...');

  // Prebuild hooks
  for (let i = 0; i < modules.length; i += 1) {
    const module = modules[i];
    if (typeof module.onPreBuild === 'function') {
      // eslint-disable-next-line
      logger.start(`Executing ${module.name}`);
      try {
        const done = await module.onPreBuild(args, settings, tempDir);
      } catch (e) {
        logger.fatal('Task aborted! Some task did not complete succesfully', e);
      }
    }
  }
  logger.success('pre-build operations done.');
}

async function postBuild(
  modules: CynModule[],
  args: mri.Argv,
  settings: any,
  folders: string[],
): Promise<void> {
  // postBuild hook
  logger.info('Running post-build operations...');

  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];

    for (let j = 0; j < modules.length; j += 1) {
      const module = modules[j];
      if (typeof module.onPostBuild === 'function') {
        try {
          await module.onPostBuild(args, settings, folder);
        } catch (e) {
          logger.fatal('Task aborted! Some task did not complete succesfully', e);
        }
      }
    }
  }
  logger.success('post-build operations done.');
}

async function postInstaller(
  modules: CynModule[],
  args: mri.Argv,
  settings: any,
  folders: string[],
): Promise<void> {
  // postInstaller hook
  logger.info('Running post-installer operations...');

  for (let j = 0; j < modules.length; j += 1) {
    const module = modules[j];
    if (typeof module.onPostInstaller === 'function') {
      try {
        // const done = await module.onPostInstaller(args, settings, module);
      } catch (e) {
        logger.fatal('Task aborted! Some task did not complete succesfully', e);
      }
    }
  }
  logger.success('post-installer operations done.');
}

export {
  preBuild,
  postBuild,
  postInstaller,
};
