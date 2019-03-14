const packager = require('electron-packager');
const path = require('path');
const { Command } = require('@efc/core');

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
    const packOptions = settings.packager;

    // TODO temp dir, copy there, build to dist

    packOptions.extraResource.push(path.join(__dirname, '../../', 'template', 'main.js'));
    packOptions.extraResource.push(path.join(__dirname, '../../', 'template', 'preload.js'));
    packOptions.extraResource.push(path.join(__dirname, '../../', 'template', 'package.json'));

    if (!packOptions.appVersion && this.deepCheck(settings, 'project.version')) packOptions.appVersion = settings.project.version;

    if (!packOptions.name && this.deepCheck(settings, 'project.name')) packOptions.name = settings.project.name;

    if (!settings.packager) {
      console.error('It looks like your "packager" configuration is empty');
      return;
    }

    try {
      const appPaths = await packager(packOptions);

      console.log('Files packages successfuly!');
      console.log(appPaths);
    } catch (e) {
      console.error('An error occured while packaging your apps');
      console.log(e);
    }
  }
};
