const fs = require('fs');
const path = require('path');

module.exports = class PluginManager {
  constructor() {
    /** @private */

    this.defaultCommandPath = path.join(__dirname, 'actions');

    /** @private */
    this.defaultCustomCommandPath = path.join(__dirname, 'plugins');

    this.commands = [];

    this.config = {};
  }

  async run(name, args, config = {}) {
    const command = this.commands.find(c => c.name === name);
    if (command) {
      if (typeof command.run === 'function') {
        await command.run(args, config);
      } else {
        console.log('No run command defined in this plugin');
      }
    } else {
      console.log('Command not found');
    }
  }

  getAliases() {
    const aliases = {};
    this.commands.forEach((command) => {
      if (!command.cli) {
        return;
      }

      Object.entries(command.cli).forEach(([key, value]) => {
        aliases[key] = value.shortcut;
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

      Object.entries(command.cli).forEach(([key, value]) => {
        defaults[key] = value.default;
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

      Object.entries(command.cli).forEach(([key, value]) => {
        if (value.boolean) {
          booleans.push(key);
        }
      });
    });
    return booleans;
  }

  setConfig(config) {
    this.config = config;
  }

  async loadFolder(commandsPath) {
    const files = fs.readdirSync(commandsPath).filter(f => path.extname(f) !== 'js');

    const fcts = [];
    files.forEach((key) => {
      fcts.push((async () => {
        const command = require(path.join(commandsPath, key));
        const c = await this.setupCommand(command);
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
  async loadDefaultCommands() {
    const commands = await this.loadFolder(this.defaultCommandPath);
    this.commands.push(...commands);
    this.commands = this.commands.filter(Boolean);
  }

  setModules() {
    this.commands.map(m => m.modules = this.commands);
  }

  /**
   *
   * @returns {module.Command} command
   * @param {String} id
   */
  get(id) {
    return this.commands.find(x => x.id === id);
  }

  /**
   * Return a list of all available getCommands
   * @returns {Array<module.Command>}
   */
  getCommands() {
    return this.commands;
  }

  /**
   * @param {module.Command} Command
   * @returns {undefined}
   */
  async setupCommand(command) {
    const { plugins } = this.config.mixed;

    // const proxiedCommand = CommandProxy(command);

    // proxiedCommand.config = this.config;

    // load it only if the proxiedCommand is a Command
    if (plugins.includes(command.name)) {
      try {
        if (typeof command.onLoad === 'function') {
          await command.onLoad();
        }
        return command;
      } catch (e) {
        console.error(e);
        return undefined;
      }
    }
    return undefined;
  }
};
