const packager = require('electron-packager');
const path = require('path');
const shelljs = require('shelljs');
const { Command } = require('@efc/core');
const install = require('install-packages');
const fs = require('fs');
const tmp = require('tmp');
const ora = require('ora');

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

  async run() {
    const { settings } = this;

    let spinner = ora('Building...').start();

    if (!settings.build) {
      spinner.fail('It looks like your "build" configuration is empty');
      return;
    }

    const packOptions = settings.build;

    tmp.setGracefulCleanup();
    const tmpDir = tmp.dirSync({
      prefix: 'efc_',
    });

    spinner.text = 'Preparing directories...';

    packOptions.dir = tmpDir.name;

    if (!path.isAbsolute(packOptions.out)) {
      packOptions.out = path.join(process.cwd(), packOptions.out);
    }

    shelljs.cp(path.join(__dirname, '../../', 'template', 'main.js'), tmpDir.name);
    shelljs.cp(path.join(__dirname, '../../', 'template', 'preload.js'), tmpDir.name);
    shelljs.cp(path.join(__dirname, '../../', 'template', 'package.json'), tmpDir.name);
    shelljs.rm('-rf', packOptions.out);

    // TODO add ignored files/folder (build, )
    shelljs.cp('-R', path.join(process.cwd(), '*'), tmpDir.name);

    // editing package.json
    const pkg = fs.readFileSync(path.join(tmpDir.name, 'package.json'));
    const pkgJson = JSON.parse(pkg);
    pkgJson.devDependencies.electron = settings.electron;
    fs.writeFileSync(path.join(tmpDir.name, 'package.json'), JSON.stringify(pkgJson, null, '\t'), 'utf8');

    spinner.text = 'Running pre-build hooks...';

    // Prebuild hooks
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      spinner.text = `Running pre-build hooks ${i}/${this.modules.length} ...`;
      spinner = spinner.stop();
      // eslint-disable-next-line
      await module.onPreBuild(tmpDir.name);
    }

    if (
      !packOptions.appVersion
      && this.deepCheck(settings, 'project.version')
    ) packOptions.appVersion = settings.project.version;

    if (!packOptions.name && this.deepCheck(settings, 'project.name')) packOptions.name = settings.project.name;

    spinner = spinner.stop();

    try {
      await install({
        cwd: tmpDir.name,
      });
      const appPaths = await packager(packOptions);

      spinner.succeed('Files packages successfuly!');
      console.log('Available files:', ...appPaths);
    } catch (e) {
      spinner.fail('An error occured while packaging your apps');
      console.log(e);
    }

    // postBuild hook
    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];
      // eslint-disable-next-line
      await module.onPostBuild(tmpDir.name);
    }
  }
};
