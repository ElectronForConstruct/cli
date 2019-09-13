const path = require('path');
const setupDir = require('../utils/setupDir');
const startPreview = require('../utils/startPreview');
const { preBuild, postBuild } = require('../utils/hooks');

/**
 * @type EFCModule
 */
module.exports = {
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
      return;
    }

    if (args.local && url) {
      this.logger.error('Cannot specify both "local" and "url" parameters');
      return;
    }

    if (args.local && args.zip) {
      this.logger.error('Cannot specify both "local" and "zip" parameters');
      return;
    }


    let zipFile = null;
    if (args.local) {
      url = '.';
    } else if (args.zip && path.extname(args.zip) === '.zip') {
      zipFile = args.zip;
      url = '.';
    } else {
      this.logger.error('Missing url argument');
      return;
    }

    const tempDir = await setupDir(settings, zipFile, 'preview');

    await preBuild(this.modules, args, settings, tempDir);
    await postBuild(this.modules, args, settings, [tempDir]);

    await startPreview(url, tempDir, settings.electron);
  },
};
