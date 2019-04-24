const logger = require('./utils/console').normal('system');

const cmds = require('./actions');

module.exports = class PluginManager {
  constructor() {
    /** @type {Array<EFCModule>} */
    this.commands = [];
  }

  async run(name, args, config = {}) {
    const command = this.commands.find(c => c.name === name);
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

  /**
   * Load default getCommands
   * @returns {Promise<void>}
   */
  async loadDefaultCommands(plugins) {
    const arr = Object.keys(cmds).map(k => cmds[k]);

    for (let i = 0; i < arr.length; i += 1) {
      const command = arr[i];

      if (plugins.includes(command.name)) {
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
    return this.commands.find(x => x.id === id);
  }

  /**
   * Return a list of all available getCommands
   * @returns {Array<EFCModule>}
   */
  getCommands() {
    return this.commands;
  }
};
