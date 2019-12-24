import path from 'path';
import setupDir from '../utils/setupDir';
import startPreview from '../utils/startPreview';
import { preBuild, postBuild } from '../utils/hooks';
import { CynModule } from '../definitions';

const command: CynModule = {
  name: 'preview',
  description: 'Preview your construct project',

  cli: [
    {
      name: 'zip',
      shortcut: 'z',
      description: 'The ZIP file to preview',
    },
    {
      name: 'local',
      shortcut: 'l',
      boolean: true,
      description: 'The URL to preview',
    },
  ],

  async run(args, settings) {
    let url = args._[1];

    if (args.zip && url) {
      this.logger.error('Cannot specify both "zip" and "url" parameters');
      return false;
    }

    if (args.local && url) {
      this.logger.error('Cannot specify both "local" and "url" parameters');
      return false;
    }

    if (args.local && args.zip) {
      this.logger.error('Cannot specify both "local" and "zip" parameters');
      return false;
    }


    let zipFile = null;
    if (args.local) {
      url = '.';
    } else if (args.zip && path.extname(args.zip) === '.zip') {
      zipFile = args.zip;
      url = '.';
    } else {
      this.logger.error('Missing url argument');
      return false;
    }

    const tempDir = await setupDir(settings, zipFile, 'preview');

    if (this.modules && this.modules.length > 0) {
      await preBuild(this.modules, args, settings, tempDir);
      await postBuild(this.modules, args, settings, [tempDir]);
    }

    await startPreview(url, tempDir/* , settings.electron */);
    return true;
  },
};

export default command;
