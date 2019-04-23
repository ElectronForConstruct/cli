const fs = require('fs');
const path = require('path');
const logger = require('./utils/console').normal('system');

module.exports = class PluginManager {
  constructor() {
    /** @private */
    this.defaultCommandPath = path.join(__dirname, 'actions');

    /** @private */
    this.defaultCustomCommandPath = path.join(__dirname, 'plugins');

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

  async loadFolder(commandsPath, plugins) {
    const files = fs.readdirSync(commandsPath).filter(f => path.extname(f) !== 'js');

    const fcts = [];
    files.forEach((key) => {
      fcts.push((async () => {
        const command = require(path.join(commandsPath, key));
        const c = await this.setupCommand(command, plugins);
        return c;
      })());
    });

    const commands = await Promise.all(fcts);
    return commands;
  }

  /**
   * Load default getCommands
   * @returns {Promise<void>}
   */
  async loadDefaultCommands(plugins) {
    const commands = await this.loadFolder(this.defaultCommandPath, plugins);
    this.commands.push(...commands);
    this.commands = this.commands.filter(Boolean);
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

  /**
   * @returns {undefined}
   * @param command
   * @param plugins
   */
  async setupCommand(command, plugins) {
    if (plugins.includes(command.name)) {
      try {
        if (typeof command.onLoad === 'function') {
          await command.onLoad();
        }
        return command;
      } catch (e) {
        logger.error(e);
        return undefined;
      }
    }
    return undefined;
  }
};
