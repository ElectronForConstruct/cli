const Console = require('../utils/console');

const logger = Console.normal('preview');

const isValid = (url) => {
  if (url === '') {
    return false;
  }
  const regexC3 = /https:\/\/preview\.construct\.net\/#.{8}$/;
  const regexC2 = /^https?:\/\/(?:localhost|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):\d*\/?$/;
  if (url.match(regexC2) || url.match(regexC3)) {
    return true;
  }
  logger.log(`Invalid URL: ${url}`);
  return false;
};

/**
 * @type EFCModule
 */
module.exports = {
  name: 'preview',
  description: 'Preview your construct project',
  cli: [
    {
      name: 'url',
      shortcut: 'u',
      description: 'The URL to preview',
    },
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
    const { prompt } = require('enquirer');
    const path = require('path');
    const setupDir = require('../utils/setupDir');
    const startPreview = require('../utils/startPreview');

    if (args.zip && args.url) {
      logger.error('Cannot specify both "zip" and "url" parameters');
      return;
    }

    if (args.local && args.url) {
      logger.error('Cannot specify both "local" and "url" parameters');
      return;
    }

    if (args.local && args.zip) {
      logger.error('Cannot specify both "local" and "zip" parameters');
      return;
    }

    let previewUrl = '';

    if (args.url) {
      previewUrl = args.url;
    } else if (args.local) {
      previewUrl = '.';
    } else {
      logger.info('To preview your Construct project in Electron, you need a valid subscription.');
      logger.info('\t• Construct 3: Go to the preview menu, hit "Remote preview" and paste the link that appear here');
      logger.info('\t• Construct 2: Start a regular browser preview and paste the link here');
      logger.info('\t• Leave blank to preview current folder\n');
      const answers = await prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Enter your Construct URL: ',
          validate: isValid,
        },
      ]);
      previewUrl = answers.url;
    }

    let zipFile = null;
    if (args.zip && path.extname(args.zip) === '.zip') {
      zipFile = previewUrl;
      previewUrl = '.';
    }

    const tempDir = await setupDir(settings, zipFile);

    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPreBuild === 'function') {
        // eslint-disable-next-line
        logger.info(`\t${i}/${this.modules.length} (${module.name}) ...`);
        await module.onPreBuild(tempDir);
      }
    }

    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPostBuild === 'function') {
        // eslint-disable-next-line
        logger.info(`\t${i}/${this.modules.length} (${module.name}) ...`);
        await module.onPostBuild(tempDir);
      }
    }

    await startPreview(previewUrl, tempDir, settings.electron);
  },
};
