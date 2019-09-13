const path = require('path');
const shelljs = require('shelljs');
const got = require('got');
const fs = require('fs');
const semver = require('semver');
const enquirer = require('enquirer');

const download = require('../utils/github-download-folder');
const installPkg = require('../utils/installPackages');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'plugin',
  description: 'Manage project plugins',

  async run(args) {
    const command = args._[1];
    const plugin = args._[2];

    if (!command) {
      this.logger.error('You must specify a command! Use "efc plugin -h" for more infos');
      return;
    }

    const pluginsDirectory = path.join(process.cwd(), '.cyn', 'plugins');
    const indexPath = path.join(pluginsDirectory, 'plugins.json');

    const indexExists = fs.existsSync(indexPath);
    let index = {};
    if (indexExists) {
      index = require(indexPath);
    }

    let pluginsDirectoryTargetPlugin = '';
    switch (command) {
      case 'add':
        // todo if no plugin specified, install everything from plugins.json
        pluginsDirectoryTargetPlugin = path.join(pluginsDirectory, plugin);
        const targetFolder = await download({
          owner: 'ElectronForConstruct',
          repo: 'plugins',
          directory: plugin,
          outputPath: pluginsDirectory,
        });
        await installPkg([], targetFolder);

        const targetPackagePath = path.join(targetFolder, 'package.json');
        const targetPackage = require(targetPackagePath);
        index[plugin] = {
          version: targetPackage.version,
          path: targetFolder,
        };

        fs.writeFileSync(indexPath, JSON.stringify(index, null, '  '));
        break;
      case 'remove':
        pluginsDirectoryTargetPlugin = path.join(pluginsDirectory, plugin);
        const answers = await enquirer.prompt({
          type: 'confirm',
          name: 'choice',
          initial: false,
          message: `You are about to remove "${plugin}" plugin at ${pluginsDirectoryTargetPlugin}. Are you sure ?`,
        });

        if (answers.choice) {
          shelljs.rm('-rf', pluginsDirectoryTargetPlugin);

          delete index[plugin];
          fs.writeFileSync(indexPath, JSON.stringify(index, null, '  '));
        }

        break;
      case 'list':
        const pluginsObject = Object.entries(index);
        const pPlugins = pluginsObject.map(async ([key, value]) => {
          const remoteVersion = await this.getRemoteVersion(key, value.branch);
          const canUpdate = semver.gt(remoteVersion, value.version);
          return `- ${key}@${value.version}${canUpdate ? ` -> ${remoteVersion}` : ''}`;
        });
        const plugins = await Promise.all(pPlugins);
        if (plugins.length === 0) {
          this.logger.info('No plugins installed');
          return;
        }
        plugins.forEach((p) => {
          this.logger.info(p);
        });
        break;
      default:
        this.logger.error('Unknown command. Use "efc plugin -h" for help.');
        break;
    }
  },
  async getRemoteVersion(plugin, branch) {
    const { body } = await got(`https://raw.githubusercontent.com/ElectronForConstruct/plugins/${branch || 'master'}/${plugin}/package.json`, { json: true });
    return body.version;
  },
};
