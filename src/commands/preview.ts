import path from 'path';
import mri from 'mri';
import setupDir from '../utils/setupDir';
import startPreview from '../utils/startPreview';
import { Settings } from '../models';
import CynModule from '../classes/cynModule';

export default class extends CynModule {
  name = 'preview';

  description = 'Preview your construct project';

  cli = [
    // {
    //   name: 'zip',
    //   shortcut: 'z',
    //   description: 'The ZIP file to preview',
    // },
    // {
    //   name: 'local',
    //   shortcut: 'l',
    //   boolean: true,
    //   description: 'The URL to preview',
    // },
  ];

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
    // const logger = this.createLogger();

    let url = args._[1];

    if (!url) {
      url = '.';
    }

    // if (args.zip && url) {
    //   logger.error('Cannot specify both "zip" and "url" parameters');
    //   return false;
    // }
    //
    // if (args.local && url) {
    //   logger.error('Cannot specify both "local" and "url" parameters');
    //   return false;
    // }
    //
    // if (args.local && args.zip) {
    //   logger.error('Cannot specify both "local" and "zip" parameters');
    //   return false;
    // }

    // let zipFile = null;
    // if (args.local) {
    //   url = '.';
    // } else if (args.zip && path.extname(args.zip) === '.zip') {
    //   zipFile = args.zip;
    //   url = '.';
    // } else {
    //   logger.error('Missing url argument');
    //   return false;
    // }

    const tempDir = await setupDir(settings, 'preview');

    await this.dispatchHook('pre-build', tempDir);
    await this.dispatchHook('post-build', [tempDir]);

    await startPreview(url, tempDir);
    return true;
  };
}
