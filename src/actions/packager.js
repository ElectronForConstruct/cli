const packager = require('electron-packager');
const path = require('path');
const shelljs = require('shelljs');
const { Command } = require('@efc/core');
const install = require('install-packages');
const tmp = require('tmp');

module.exports = class extends Command {
  constructor() {
    super('packager', 'Package app', 'k');

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

  async run() {
    const { settings } = this;

    if (!settings.packager) {
      console.error('It looks like your "packager" configuration is empty');
      return;
    }

    const packOptions = settings.packager;

    tmp.setGracefulCleanup();
    const tmpDir = tmp.dirSync({
      prefix: 'efc_',
    });

    console.log('Preparing...');

    packOptions.dir = tmpDir.name;

    if (!path.isAbsolute(packOptions.out)) {
      packOptions.out = path.join(process.cwd(), packOptions.out);
    }

    shelljs.cp(path.join(__dirname, '../../', 'template', 'main.js'), tmpDir.name);
    shelljs.cp(path.join(__dirname, '../../', 'template', 'preload.js'), tmpDir.name);
    shelljs.cp(path.join(__dirname, '../../', 'template', 'package.json'), tmpDir.name);
    shelljs.rm('-rf', packOptions.out);
    shelljs.cp('-R', path.join(process.cwd(), '*'), tmpDir.name);

    if (
      !packOptions.appVersion
      && this.deepCheck(settings, 'project.version')
    ) packOptions.appVersion = settings.project.version;

    if (!packOptions.name && this.deepCheck(settings, 'project.name')) packOptions.name = settings.project.name;

    try {
      await install({
        cwd: tmpDir.name,
      });
      const appPaths = await packager(packOptions);

      console.log('Files packages successfuly!');
      console.log(...appPaths);
    } catch (e) {
      console.error('An error occured while packaging your apps');
      console.log(e);
    }
  }
};
