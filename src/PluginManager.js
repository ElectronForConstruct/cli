const fs = require('fs');
const path = require('path');

module.exports = class PluginManager {
  constructor() {
    /** @private */

    this.defaultCommandPath = path.join(__dirname, 'actions');

    /** @private */
    this.defaultCustomCommandPath = path.join(process.cwd(), 'plugins');

    /**
     *
     * @type {Array<module.Command>}
     * @private
     */
    this._commands = [];
  }

  /**
   *
   * @param {string} commandsPath
   * @param {Object} config
   * @returns void
   * @private
   */
  async loadCommands(commandsPath, config) {
    const files = fs.readdirSync(commandsPath).filter(f => path.extname(f) !== 'js');
    const commands = [];

    files.forEach((key) => {
      try {
        // eslint-disable-next-line
        commands.push(require(path.join(commandsPath, key)));
      } catch (e) {
        console.error(`Unable to load module ${key}`);
      }
    });

    if (commands.length === 0) return;

    // ---

    const promises = [];
    commands.forEach(async (Command) => {
      promises.push(this.loadCommand(config, Command));
    });

    await Promise.all(promises);
  }

  /**
   * Load default commands
   * @returns {Promise<void>}
   */
  async loadDefaultCommands(config = {}) {
    await this.loadCommands(this.defaultCommandPath, config);
  }

  /**
   * Load commands from a cutom path
   * @returns {Promise<void>}
   */
  async loadCustomCommands(config = {}) {
    /** @type Array<string> */
    const { plugins } = config.settings;

    // Load local plugins (files and folders)
    if (fs.existsSync(this.defaultCustomCommandPath)) {
      await this.loadCommands(this.defaultCustomCommandPath, config);
    }

    // load from node_modules
    const nodeModules = path.join(process.cwd(), 'node_modules');
    const proms = [];
    plugins.forEach((plugin) => {
      if (fs.existsSync(path.join(nodeModules, '@electronforconstruct', `plugin-efc-${plugin}`))) {
        // eslint-disable-next-line
        const Command = require(path.join(nodeModules, '@electronforconstruct', `plugin-efc-${plugin}`));
        proms.push(this.loadCommand(config, Command));
      } else if (fs.existsSync(path.join(nodeModules, `plugin-efc-${plugin}`))) {
        // eslint-disable-next-line
        const Command = require(path.join(nodeModules, `plugin-efc-${plugin}`));
        proms.push(this.loadCommand(config, Command));
      }
    });

    await Promise.all(proms);
  }

  /**
   * Set gloabl config to be accessible through any module
   * @param config
   * @returns {Promise<void>}
   */
  async setConfig(config) {
    this.commands.map(m => m.setConfig(config));
  }

  /**
   * Set modules friends to be accesible from any module
   * @param {Array<module.Command>} modules
   * @returns {Promise<void>}
   */
  async setModules(modules) {
    const newModules = modules.map((m) => {
      const newModule = Object.assign({}, m);
      delete newModule.config; // circular references
      delete newModule.modules; // circular references
      return newModule;
    });
    this.commands.map(m => m.setModules(newModules));
  }

  /**
   *
   * @returns {module.Command} command
   * @param {String} id
   */
  get(id) {
    return this._commands.find(x => x.id === id);
  }

  /**
   * Return a list of all available commands
   * @returns {Array<module.Command>}
   */
  get commands() {
    return this._commands;
  }

  /**
   * @param {Object} config
   * @param {module.Command} Command
   * @returns {undefined}
   */
  async loadCommand(config, Command) {
    const { plugins } = config.settings;

    return new Promise(async (resolve) => {
      const newCommand = new Command();
      newCommand.setConfig(config);

      if (!newCommand.show()) {
        resolve(undefined);
      } else if (Object.getPrototypeOf(newCommand.constructor).name === 'Command') {
        if (plugins.includes(newCommand.id)) {
          await newCommand.onLoad();
          this._commands.push(newCommand);
          resolve(newCommand);
        }
        resolve(undefined);
      } else {
        console.log(`Plugin ${newCommand.name} (${newCommand.id}) is not a valid module. You must inherit from the Command class`);
        resolve(undefined);
      }
    });
  }
};