import path from 'path';
import mri from 'mri';
import setupDir from '../utils/setupDir';
import startPreview from '../utils/startPreview';
import { Settings } from '../models';
import CynModule from '../classes/cynModule';

export default class extends CynModule {
  name = 'preview';

  description = 'Preview your app';

  cli = [
  ];

  private isUrl = (str: string): boolean => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(str);

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
    // const logger = this.createLogger();

    let arg = args._[1];

    if (!arg) {
      arg = '.';
    }

    if (this.isUrl(arg)) {

    }

    const tempDir = await setupDir(settings, 'preview');

    await this.dispatchHook('pre-build', tempDir);
    await this.dispatchHook('post-build', [tempDir]);

    await startPreview(arg, tempDir);
    return true;
  };
}
