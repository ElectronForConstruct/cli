const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');
const ws = require('windows-shortcuts');
const { Command } = require('../core');
const setupDir = require('../utils/setupDir');
const semver = require('semver');

module.exports = class extends Command {
  constructor() {
    super('build', 'Package app', 'b');

    this.setCategory('Toolchain');
    this.setDescription('Allow you to cross-compile your project to different OS');
  }

  deepCheck(target, p, value) {
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
  }

  async run(args = {}) {
    const argsLenth = Object.keys(args).length;

    const { settings } = this;

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
    // shelljs.rm('-rf', packOptions.out);

    // setup directories
    let zipFile = null;
    if (argsLenth === 1) {
      // eslint-disable-next-line
      zipFile = args[ 0 ];
    }
    const tempDir = await setupDir(settings, zipFile);

    // set src dir to tmpdir
    packOptions.dir = tempDir;

    console.log('Running pre-build hooks...');

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
      && this.deepCheck(settings, 'project.version')
    ) {
      packOptions.appVersion = settings.project.version;
    }

    if (!packOptions.name && this.deepCheck(settings, 'project.name')) {
      packOptions.name = settings.project.name;
    }

    if (!this.deepCheck(packOptions, 'win32metadata.CompanyName') && this.deepCheck(settings, 'project.author')) {
      packOptions.win32metadata.CompanyName = settings.project.author;
    }

    // ////////////////////////////

    try {
      const appPaths = await packager(packOptions);

      console.log('Files packages successfuly!');
      console.log('Available files:', ...appPaths);
    } catch (e) {
      console.error('An error occured while packaging your apps');
      console.log(e);
    }

    const folders = fs.readdirSync(packOptions.out);

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
        const fullPath = path.join(packOptions.out, folder);
        if (folder.includes('win32')) {
          ws.create(fullPath, {
            target: path.join(fullPath, `${packOptions.name}.exe`),
            args: switchesAsString.join(' '),
          });
        }
      });
    }

    // postBuild hook
    console.log('Running post-build hooks...');

    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];

      for (let j = 0; j < this.modules.length; j += 1) {
        const module = this.modules[j];
        if (typeof module.onPostBuild === 'function') {
          console.info(`\t${j}/${this.modules.length} - ${folder} (${module.rawName}) ...`);
          // eslint-disable-next-line
          await module.onPostBuild(path.join(packOptions.out, folder));
        }
      }
    }
  }
};
