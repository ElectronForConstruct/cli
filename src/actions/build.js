const path = require('path');
const log = require('../utils/console').normal('build');
const prettyDisplayFolders = require('../utils/prettyFolder');
const deepCheck = require('../utils/deepValueCheck');

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
    const tempDir = await setupDir(settings, zipFile);

    // set src dir to tmpdir
    packOptions.dir = tempDir;

    log.info('Running pre-build operations...');

    // Prebuild hooks
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPreBuild === 'function') {
        // eslint-disable-next-line
        log.start(`Executing ${module.name}`);
        const done = await module.onPreBuild(args, settings, tempDir);
        if (!done) {
          log.fatal('Task aborted! Some task did not complete succesfully');
          return;
        }
      }
    }
    log.success('pre-build operations done.');

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

    if (settings.switches.length > 0 && semver.satisfies(settings.electron, '>= 4')) {
      const switchesAsString = settings.switches.map((flag) => {
        let f = Array.isArray(flag) ? flag[0] : flag;

        if (Array.isArray(flag)) {
          if (f[0] !== '-' && f[1] !== '-') {
            f = `--${f}`;
          }
          return `${f}=${flag[1]}`;
        }

        if (f[0] !== '-' && f[1] !== '-') {
          f = `--${f}`;
        }
        return f;
      });

      // make a shortcut on windows
      folders.forEach((folder) => {
        if (folder.includes('win32')) {
          ws.create(folder, {
            target: path.join(folder, `${packOptions.name}.exe`),
            args: switchesAsString.join(' '),
          });
        }
      });
    }

    // postBuild hook
    log.info('Running post-build operations...');

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      for (let j = 0; j < this.modules.length; j += 1) {
        const module = this.modules[j];
        if (typeof module.onPostBuild === 'function') {
          const done = await module.onPostBuild(args, settings, folder);
          if (!done) {
            log.fatal('Task aborted! Some task did not complete succesfully');
            return;
          }
        }
      }
    }
    log.success('post-build operations done.');
  },
};
