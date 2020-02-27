import path from 'path';
import mri from 'mri';
import setupDir from '../utils/setupDir';
import startPreview from '../utils/startPreview';
import CynModule from '../classes/cynModule';
import SettingsManager from '../classes/settingsManager';

export default class extends CynModule {
  name = 'preview';

  description = 'Preview your app';

  cli = [
    {
      description: 'Clear the cache of the project',
      name: 'clear-cache',
      boolean: true,
    },
  ];

  run = async (args: mri.Argv): Promise<boolean> => {
    // const logger = this.createLogger();

    const sm = SettingsManager.getInstance();

    let workingDirectoryOrURL = args._[1];

    if (!workingDirectoryOrURL) {
      workingDirectoryOrURL = process.cwd();
    }

    // ----

    await sm.loadConfig(workingDirectoryOrURL);

    const tempDir = await setupDir('preview');

    await this.dispatchHook('pre-build', tempDir);
    await this.dispatchHook('post-build', [tempDir]);

    await startPreview(workingDirectoryOrURL, tempDir);
    return true;
  };
}
