const packager = require('electron-packager');
const path = require('path');
const { Command } = require('../core');
const setupDir = require('../utils/setupDir');

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
      zipFile = args[0];
    }
    const tempDir = await setupDir(settings, zipFile);

    // set src dir to tmpdir
    packOptions.dir = tempDir;

    console.log('Running pre-build hooks...');

    // Prebuild hooks
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPostBuild === 'function') {
        console.info(`\t${i}/${this.modules.length} (${module.rawName}) ...`);
        // eslint-disable-next-line
        await module.onPreBuild(tempDir);
      }
    }

    if (
      !packOptions.appVersion
      && this.deepCheck(settings, 'project.version')
    ) {
      packOptions.appVersion = settings.project.version;
    }

    if (!packOptions.name && this.deepCheck(settings, 'project.name')) {
      packOptions.name = settings.project.name;
    }

    try {
      const appPaths = await packager(packOptions);

      console.log('Files packages successfuly!');
      console.log('Available files:', ...appPaths);
    } catch (e) {
      console.error('An error occured while packaging your apps');
      console.log(e);
    }

    // postBuild hook
    console.log('Running post-build hooks...');
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      if (typeof module.onPostBuild === 'function') {
        console.info(`\t${i}/${this.modules.length} (${module.rawName}) ...`);
        // eslint-disable-next-line
        await module.onPostBuild(packOptions.out);
      }
    }
  }
};
