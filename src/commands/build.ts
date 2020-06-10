import setupDir from '../utils/setupDir';
import { createScopedLogger } from '../utils/console';
import { dispatchHook } from '../classes/hooksManager';

export default async function build(options: any): Promise<boolean> {
  const logger = createScopedLogger('build');

  // setup directories
  const tempDir = await setupDir('build');

  try {
    await dispatchHook('build', tempDir);
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}
