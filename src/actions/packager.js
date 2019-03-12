const packager = require('electron-packager');
const Command = require('../classes/Command');

module.exports = class extends Command {
  constructor() {
    super('packager', 'Package app', 'p');

    this.setCategory('Toolchain');
    this.setDescription('Allow you to cross-compile your project to different OS');
  }

  deepCheck(target, path, value) {
    if (typeof target !== 'object' || target === null) {
      return false;
    }

    const parts = path.split('.');

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
