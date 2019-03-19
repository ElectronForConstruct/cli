const fs = require('fs');
const path = require('path');

module.exports = class PluginManager {
  constructor(defaultCommandPath, defaultCustomCommandPath) {
    /** @private */

    this.defaultCommandPath = defaultCommandPath;

    /** @private */
    this.defaultCustomCommandPath = path.join(process.cwd(), 'plugins');

    /**
     *
     * @type {Array<module.Command>}
     * @private
     */
    this._commands = [];

    this.config = {};
  }

  setDefaultConfig(config) {
    this.config = config;
  }

  async _loadFolder(commandsPath) {
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
    const commands = await this._loadFolder(this.defaultCommandPath);
    this._commands.push(...commands);
    this._commands = this._commands.filter(Boolean);
  }

  /**
   * Load getCommands from a cutom path
   * @returns {Promise<void>}
   */
  async loadCustomCommands() {
    /** @type Array<string> */
    const { plugins } = this.config.mixed;
    const commands = [];

    // load from node_modules
    const nodeModules = path.join(process.cwd(), 'node_modules');
    const proms = [];
    plugins.forEach((pluginName) => {
      const scopedPath = path.join(nodeModules, '@efc', `plugin-efc-${pluginName}`);
      const nonScopedPath = path.join(nodeModules, `plugin-efc-${pluginName}`);

      proms.push((async () => {
        let Command = null;
        if (fs.existsSync(scopedPath)) {
          Command = require(scopedPath);
        } else if (fs.existsSync(nonScopedPath)) {
          Command = require(nonScopedPath);
        }
        if (!Command) {
          return undefined;
        }
        const c = await this.setupCommand(Command);
        return c;
      })());
    });

    const cmds = await Promise.all(proms);
    commands.push(...cmds);

    this._commands.push(...commands);
    this._commands = this._commands.filter(Boolean);
  }

  setModules() {
    /* const newModules = this._commands.map((m) => {
      const newModule = Object.assign({}, m);
      delete newModule.config; // circular references
      delete newModule.modules; // circular references
      return newModule;
    }); */
    // this._commands.map(m => m.setModules(newModules));
    this._commands.map(m => m.setModules(this._commands));
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
   * Return a list of all available getCommands
   * @returns {Array<module.Command>}
   */
  getCommands() {
    return this._commands;
  }

  /**
   * @param {module.Command} Command
   * @returns {undefined}
   */
  async setupCommand(Command) {
    const { plugins } = this.config.mixed;

    const newCommand = new Command();
    newCommand.setConfig(this.config);

    // if the command is not visible, don't load it
    if (!newCommand.isVisible()) {
      return undefined;
    }

    // load it only if the command is a Command
    if (Object.getPrototypeOf(newCommand.constructor).name === 'Command') {
      if (plugins.includes(newCommand.id)) {
        try {
          await newCommand.onLoad();
          return newCommand;
        } catch (e) {
          console.error(e);
          return undefined;
        }
      }
      return undefined;
    }
    console.log(`Plugin ${newCommand.name} (${newCommand.id}) is not a valid module. You must inherit from the Command class`);
    return undefined;
  }
};
