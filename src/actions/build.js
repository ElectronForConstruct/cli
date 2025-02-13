const path = require('path');
const log = require('../utils/console').normal('build');
const prettyDisplayFolders = require('../utils/prettyFolder');
const deepCheck = require('../utils/deepValueCheck');
const { postBuild, preBuild } = require('../utils/hooks');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'build',
  cli: [
    {
      name: 'zip',
      shortcut: 'z',
      description: 'A zip file to use instead of the "app" folder',
    },
    {
      name: 'production',
      boolean: true,
      default: false,
      shortcut: 'p',
      description: 'Run in production mode',
    },
  ],
  description: 'Package your app for any OS',
  config: {
    dir: process.cwd(),
    asar: true,
    icon: path.join(process.cwd(), 'build', 'icon'),
    out: 'dist',
    overwrite: true,
    extraResource: [],
    ignore: [
      'preview*',
      'node_modules/greenworks',
      'node_modules/app-builder-bin',
      'node_modules/app-builder-lib',
    ],
    win32metadata: {},
  },
  /**
   * @param args
   * @param {Settings} settings
   * @return {Promise<void>}
   */
  async run(args, settings) {
    const packager = require('electron-packager');
    const fs = require('fs');
    const ws = require('windows-shortcuts');
    const semver = require('semver');
    const setupDir = require('../utils/setupDir');

    log.info('Build started...');

    if (!settings.build) {
      log.error('It looks like your "build" configuration is empty');
      return;
    }

    const packOptions = settings.build;
    if (settings.electron) {
      packOptions.electronVersion = settings.electron;
    }

    // resolve out directory and delete it
    if (!path.isAbsolute(packOptions.out)) {
      packOptions.out = path.join(process.cwd(), packOptions.out);
    }

    // setup directories
    const zipFile = args.zip ? args.zip : null;
    const tempDir = await setupDir(settings, zipFile, 'build');

    // set src dir to tmpdir
    packOptions.dir = tempDir;

    await preBuild(this.modules, args, settings, tempDir);

    // Compute datas //////////////

    if (
      !packOptions.appVersion
      && deepCheck(settings, 'project.version')
    ) {
      packOptions.appVersion = settings.project.version;
    }

    if (!packOptions.name && deepCheck(settings, 'project.name')) {
      packOptions.name = settings.project.name;
    }

    if (!deepCheck(packOptions, 'win32metadata.CompanyName') && deepCheck(settings, 'project.author')) {
      packOptions.win32metadata.CompanyName = settings.project.author;
    }

    packOptions.quiet = true;

    // ////////////////////////////

    try {
      log.start('Packaging started');
      const appPaths = await packager(packOptions);

      log.success('Files packed successfuly!');
      prettyDisplayFolders(appPaths);
    } catch (e) {
      log.error('An error occured while packaging your apps');
      log.error(e);
    }

    const isDirectory = source => fs.lstatSync(source).isDirectory();
    const folders = fs
      .readdirSync(packOptions.out)
      .map(name => path.join(packOptions.out, name))
      .filter(isDirectory);

    await postBuild(this.modules, args, settings, folders);
  },
};
