const path = require('path');
const fs = require('fs');
const logger = require('./utils/console')
  .normal('system');
const Logger = require('./utils/console');

const cmds = require('./actions');

module.exports = class PluginManager {
  constructor() {
    /** @type {Array<EFCModule>} */
    this.commands = [];
  }

  async run(name, args, config = {}) {
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
    const aliases = {};
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
    const defaults = {};
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
    const booleans = [];
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
      .map(([name, infos]) => {
        let module = null;

        try {
          module = require(infos.path);
          module.Logger = Logger;
        } catch (e) {
          logger.error(`Unable to load ${name}`);
        }

        return module;
      });
    return plugins.filter(Boolean);
  }

  /**
   * Load default getCommands
   * @returns {Promise<void>}
   */
  async loadCommands() {
    const availableCommands = Object.keys(cmds)
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

  // eslint-disable-next-line
  setModules() {
    // eslint-disable-next-line
    this.commands.map(m => m.modules = this.commands);
  }

  /**
   *
   * @returns {EFCModule} command
   * @param {String} id
   */
  get(id) {
    return this.commands.find((x) => x.id === id);
  }

  /**
   * Return a list of all available getCommands
   * @returns {Array<EFCModule>}
   */
  getCommands() {
    return this.commands;
  }
};
