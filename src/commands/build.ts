import setupDir from '../utils/setupDir';
import SettingsManager from '../classes/settingsManager';
import { createScopedLogger } from '../utils/console';
import { dispatchHook } from '../classes/hooksManager';

export default async function build(options: any): Promise<boolean> {
  const sm = SettingsManager.getInstance();

  const logger = createScopedLogger('build');

  const settings = sm.computeSettings();

  logger.info('Build started...');

  // setup directories
  const tempDir = await setupDir('build');

  try {
    await dispatchHook('pre-build', tempDir, settings);
    await dispatchHook('build', tempDir, settings);
    await dispatchHook('post-build', tempDir, settings);
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}
