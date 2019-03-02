const fs = require('fs');
const path = require('path');
const isDev = require('./isDev');

module.exports = class PluginManager {
  constructor() {
    /** @private */

    if (isDev) this.defaultCommandPath = path.join(__dirname, 'actions');
    else this.defaultCommandPath = path.join(__dirname, '..', 'src', 'actions');

    /** @private */
    this.defaultCustomCommandPath = path.join(process.cwd(), 'plugins');

    /**
     *
     * @type {Array<Command>}
     * @private
     */
    this._commands = [];
  }

  /**
   *
   * @param {string} commandsPath
   * @returns void
   * @private
   */
  async loadCommands(commandsPath, config) {
    let promises = [];
    const files = fs.readdirSync(commandsPath).filter(f => path.extname(f) !== 'js');

    files.forEach((key) => {
      promises.push(require(path.join(commandsPath, key)));
    });

    let commands = [];
    try {
      commands = await Promise.all(promises);
    } catch (e) {
      console.log(e);
    }

    if (commands.length === 0) return;

    // ---

    promises = [];
    commands.forEach(async (x) => {
      promises.push(
        new Promise(async (resolve) => {
          /** @type Command */
          // eslint-disable-next-line
          const newClass = new x();
          newClass.setConfig(config);
          if (!newClass.show()) {
            resolve(undefined);
          } else if (Object.getPrototypeOf(newClass.constructor).name === 'Command') {
            await newClass.onLoad();
            this._commands.push(newClass);
            resolve(newClass);
          } else {
            console.log(`Plugin ${newClass.name} (${newClass.id}) is not a valid module. You must inherit from the Command class`);
            resolve(undefined);
          }
        }),
      );
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
    if (fs.existsSync(this.defaultCustomCommandPath)) {
      await this.loadCommands(this.defaultCustomCommandPath, config);
    }
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
   * @param {Array<Command>} modules
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
   * @returns {Command} command
   * @param {String} id
   */
  get(id) {
    return this._commands.find(x => x.id === id);
  }

  /**
   * Return a list of all available commands
   * @returns {Array<Command>}
   */
  get commands() {
    return this._commands;
  }
};
