import * as path from 'path';
import * as fs from 'fs';
import mri from 'mri';
import * as Logger from '../utils/console';
import { postBuild, preBuild, postInstaller } from '../utils/hooks';
import setupDir from '../utils/setupDir';
import prettyDisplayFolders from '../utils/prettyFolder';

import { CynModule, Settings } from '../models';

import * as cmds from '../commands';

const logger = Logger.createNormalLogger('system');

export default class PluginManager {
  private static instance: PluginManager;

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  commands: CynModule[] = [];

  run(name: string, args: mri.Argv, config: Settings = {}): Promise<boolean> | boolean {
    const command = this.commands.find((c) => c.name === name);
    if (command) {
      if (typeof command.run === 'function') {
        return command.run(args, config);
      }
      logger.info('No "run" command defined in this plugin');
    } else {
      logger.error(`Command ${name} not found`);
    }
    return false;
  }

  getAliases(): object {
    const aliases: { [index: string]: string | undefined } = {};
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

  getDefaults(): object {
    const defaults: { [index: string]: boolean | undefined } = {};
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

  getBooleans(): string[] {
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

  async getAvailablePlugins(): Promise<CynModule[]> {
    const pluginsDirectory = path.join(process.cwd(), 'plugins');

    if (!fs.existsSync(pluginsDirectory)) {
      return [];
    }

    const pluginsIndex = path.join(pluginsDirectory, 'plugins.json');

    console.log('pluginsIndex', pluginsIndex);

    const index = await import(pluginsIndex);

    console.log('index', index);

    const plugins = Object.entries(index)
      .map(([name, infos]: [string, any]) => {
        let module;

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
      // eslint-disable-next-line
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

  enhanceModules(): void {
    this.commands.forEach((module) => {
      module.logger = Logger.createNormalLogger(module.name);
      module.iLogger = Logger.createInteractiveLogger(module.name);

      module.Utils = {
        postBuild,
        preBuild,
        postInstaller,
        setupDir,
        prettyDisplayFolders,
      };
    });
  }

  setModules(): void {
    this.commands.forEach((m) => {
      m.modules = this.commands;
    });
  }

  get(id: string): CynModule | undefined {
    return this.commands.find((x) => x.id === id);
  }

  getCommands(): CynModule[] {
    return this.commands;
  }
}
