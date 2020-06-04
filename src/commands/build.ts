import setupDir from '../utils/setupDir';
import SettingsManager from '../classes/settingsManager';
import { createScopedLogger } from '../utils/console';
import { dispatchHook } from '../classes/hooksManager';

export default async function build(options: any): Promise<boolean> {
  // const logger = this.createLogger();

  const sm = SettingsManager.getInstance();

  // ---- TODO this is shared with preview ^^^

  const logger = createScopedLogger('build');

  const { settings } = sm;

  logger.info('Build started...');

  // setup directories
  const tempDir = await setupDir('build');

  await dispatchHook('pre-build', tempDir, settings);
  await dispatchHook('build', tempDir, settings);
  await dispatchHook('post-build', tempDir, settings);

  return true;
}
