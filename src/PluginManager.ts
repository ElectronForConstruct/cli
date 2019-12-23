import * as path from 'path';
import * as fs from 'fs';
const logger = require('./utils/console')
  .normal('system');
import Logger from './utils/console';
import { postBuild, preBuild, postInstaller } from '../../cli/src/utils/hooks';
import setupDir from '../../cli/src/utils/setupDir';
import prettyDisplayFolders from '../../cli/src/utils/prettyFolder';

import { EFCModule } from './doc'
import mri from 'mri';

import * as cmds from './actions';

export default class PluginManager {
  private static instance: PluginManager;

  private constructor() {
  }

  static getInstance() {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  commands: EFCModule[] = [];

  async run(name: string, args: mri.Argv, config = {}) {
    const command = this.commands.find((c) => c.name === name);
    if (command) {
      if (typeof command.run === 'function') {
        await command.run(args, config);
      } else {
        logger.info('No "run" command defined in this plugin');
      }
    } else {
      logger.error(`Command ${name} not found`);
    }
  }

  getAliases() {
    const aliases: { [index: string]: any } = {};
    this.commands.forEach((command) => {
      if (!command.cli) {
        return;
      }

      command.cli.forEach((value) => {
        aliases[value.name] = value.shortcut;
      });
    });
    return aliases;
  }

  getDefaults() {
    const defaults: { [index: string]: any } = {};
    this.commands.forEach((command) => {
      if (!command.cli) {
        return;
      }

      command.cli.forEach((value) => {
        defaults[value.name] = value.default;
      });
    });
    return defaults;
  }

  getBooleans() {
    const booleans: string[] = [];
    this.commands.forEach((command) => {
      if (!command.cli) {
        return;
      }

      command.cli.forEach((value) => {
        if (value.boolean) {
          booleans.push(value.name);
        }
      });
    });
    return booleans;
  }

  async getAvailablePlugins() {
    const pluginsDirectory = path.join(process.cwd(), 'plugins');

    if (!fs.existsSync(pluginsDirectory)) {
      return [];
    }

    const pluginsIndex = path.join(pluginsDirectory, 'plugins.json');

    const index = require(pluginsIndex);

    const plugins = Object.entries(index)
      .map(([name, infos]: [any, any]) => {
        let module = null;

        try {
          module = require(infos.path);
        } catch (e) {
          logger.error(`Unable to load ${name}`);
        }

        return module;
      });
    return plugins.filter(Boolean);
  }

  async loadCommands() {
    const availableCommands = Object.keys(cmds)
      // @ts-ignore
      .map((k) => cmds[k]);
    const availablePlugins = await this.getAvailablePlugins();

    const allCommands = [...availableCommands, ...availablePlugins];


    for (let i = 0; i < allCommands.length; i += 1) {
      const command = allCommands[i];

      try {
        if (typeof command.onLoad === 'function') {
          await command.onLoad();
        }
        this.commands.push(command);
      } catch (e) {
        logger.error(e);
      }
    }
  }

  enhanceModules() {
    this.commands.forEach((module) => {
      module.logger = Logger.normal(module.name);
      module.iLogger = Logger.interactive(module.name);

      module.Utils = {
        postBuild,
        preBuild,
        postInstaller,
        setupDir,
        prettyDisplayFolders,
      };
    });
  }

  setModules() {
    this.commands.map(m => m.modules = this.commands);
  }

  get(id: string): EFCModule | undefined {
    return this.commands.find((x) => x.id === id);
  }

  getCommands(): EFCModule[] {
    return this.commands;
  }
};
