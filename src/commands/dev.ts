import setupDir from '../utils/setupDir';
import startPreview from '../utils/startPreview';
import SettingsManager from '../classes/settingsManager';
import { dispatchHook } from '../classes/hooksManager';

// cli = [
//   {
//     description: 'Clear the cache of the project',
//     name: 'clear-cache',
//     boolean: true,
//   },
// ];

export default async function run(options: any): Promise<boolean> {
  // const logger = this.createLogger();

  const sm = SettingsManager.getInstance();

  let workingDirectoryOrURL = options.path;

  if (!workingDirectoryOrURL) {
    workingDirectoryOrURL = process.cwd();
  }

  // ----

  await sm.loadConfig(workingDirectoryOrURL);

  const tempDir = await setupDir('preview');

  await dispatchHook('pre-build', tempDir);
  await dispatchHook('post-build', [tempDir]);

  await startPreview(workingDirectoryOrURL, tempDir);
  return true;
}
