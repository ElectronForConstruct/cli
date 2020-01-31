import * as path from 'path';
import fs from 'fs-extra';
import got from 'got';
import semver from 'semver';
import Confirm from 'prompt-confirm';
import mri from 'mri';
import download from '../utils/githubDownloadFolder';
import installPkg from '../utils/installPackages';
import { Settings } from '../models';
import CynModule from '../classes/cynModule';

async function getRemoteVersion(plugin: string, branch: string): Promise<string> {
  const { body } = await got(
    `https://raw.githubusercontent.com/ElectronForConstruct/plugins/${branch || 'master'}/${plugin}/package.json`,
  ).json();
  return body.version;
}

export const hooks = [];
export const command = class Plugin extends CynModule {
  name = 'plugin';

  description = 'Manage project plugins';

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
    const logger = this.createLogger();

    const subcommand = args._[1];
    const plugin = args._[2];

    if (!subcommand) {
      logger.error('You must specify a command! Use "efc plugin -h" for more infos');
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
        } = await new Confirm(`You are about to remove "${plugin}" plugin at ${pluginsDirectoryTargetPlugin}. Are you sure ?`).run();

        if (answers.choice) {
          await fs.remove(pluginsDirectoryTargetPlugin);

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
          logger.info('No plugins installed');
          return false;
        }
        plugins.forEach((p) => {
          logger.info(p);
        });
        break;
      default:
        logger.error('Unknown command. Use "efc plugin -h" for help.');
        break;
    }
    return true;
  };
};
