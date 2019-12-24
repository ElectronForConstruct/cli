import * as path from 'path';
import * as fs from 'fs';
import shelljs from 'shelljs';
import got from 'got';
import semver from 'semver';
import enquirer from 'enquirer';
import download from '../utils/github-download-folder';
import installPkg from '../utils/installPackages';
import { CynModule } from '../definitions';

async function getRemoteVersion(plugin: string, branch: string): Promise<string> {
  const { body } = await got(
    `https://raw.githubusercontent.com/ElectronForConstruct/plugins/${branch || 'master'}/${plugin}/package.json`,
  ).json();
  return body.version;
}

const command: CynModule = {
  name: 'plugin',
  description: 'Manage project plugins',

  async run(args) {
    const subcommand = args._[1];
    const plugin = args._[2];

    if (!subcommand) {
      this.logger.error('You must specify a command! Use "efc plugin -h" for more infos');
      return false;
    }

    const pluginsDirectory = path.join(process.cwd(), '.cyn', 'plugins');
    const indexPath = path.join(pluginsDirectory, 'plugins.json');

    const indexExists = fs.existsSync(indexPath);
    let index: {
      [index: string]: {
        version: string;
        path: string;
        branch: string;
      };
    } = {};
    if (indexExists) {
      index = require(indexPath);
    }

    let pluginsDirectoryTargetPlugin = '';
    switch (subcommand) {
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
        const targetPackage = await import(targetPackagePath);
        index[plugin] = {
          version: targetPackage.version,
          path: targetFolder,
          branch: 'master',
        };

        fs.writeFileSync(indexPath, JSON.stringify(index, null, '  '));
        break;
      case 'remove':
        pluginsDirectoryTargetPlugin = path.join(pluginsDirectory, plugin);
        const answers: {
          choice: string;
        } = await enquirer.prompt({
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
          const remoteVersion = await getRemoteVersion(key, value.branch);
          const canUpdate = semver.gt(remoteVersion, value.version);
          return `- ${key}@${value.version}${canUpdate ? ` -> ${remoteVersion}` : ''}`;
        });
        const plugins = await Promise.all(pPlugins);
        if (plugins.length === 0) {
          this.logger.info('No plugins installed');
          return false;
        }
        plugins.forEach((p) => {
          this.logger.info(p);
        });
        break;
      default:
        this.logger.error('Unknown command. Use "efc plugin -h" for help.');
        break;
    }
    return true;
  },
};
export default command;
