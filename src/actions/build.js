const path = require('path');

const deepCheck = (target, p, value) => {
  if (typeof target !== 'object' || target === null) {
    return false;
  }

  const parts = p.split('.');

  while (parts.length) {
    const property = parts.shift();
    // eslint-disable-next-line
    if (!(target.hasOwnProperty(property))) {
      return false;
    }
    // eslint-disable-next-line
    target = target[ property ];
  }

  if (value) {
    return target === value;
  }
  return true;
};

module.exports = {
  name: 'build',
  cli: {
    zip: {
      shortcut: 'z',
      description: 'A zip file to use instead of the "app" folder',
    },
    production: {
      boolean: true,
      default: false,
      shortcut: 'p',
      description: 'Run in production mode',
    },
  },
  usage: 'build [ [ -z zip ] [ -p ] [ -d ] ]',
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
  async run(args, settings) {
    const packager = require('electron-packager');
    const fs = require('fs');
    const ws = require('windows-shortcuts');
    const semver = require('semver');
    const setupDir = require('../utils/setupDir');

    console.log('Build started...');

    if (!settings.build) {
      console.error('It looks like your "build" configuration is empty');
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

    console.log('Running pre-build operations...');

    // Prebuild hooks
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPreBuild === 'function') {
        console.info(`\t${i}/${this.modules.length} (${module.rawName}) ...`);
        // eslint-disable-next-line
        await module.onPreBuild(tempDir);
      }
    }

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

    // ////////////////////////////

    try {
      const appPaths = await packager(packOptions);

      console.log('Files packed successfuly!');
      console.log('Available files:', ...appPaths);
    } catch (e) {
      console.error('An error occured while packaging your apps');
      console.log(e);
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

      console.log(folders);

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
    console.log('Running post-build operations...');

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      for (let j = 0; j < this.modules.length; j += 1) {
        const module = this.modules[j];
        if (typeof module.onPostBuild === 'function') {
          console.info(`\t${j}/${this.modules.length} - ${folder} (${module.rawName}) ...`);
          // eslint-disable-next-line
          await module.onPostBuild(folder);
        }
      }
    }
  },
};
