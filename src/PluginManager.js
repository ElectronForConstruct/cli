import fs from 'fs';
import path from 'path';

export default class PluginManager {
  constructor() {
    /** @private */
    this.defaultCommandPath = path.join(__dirname, 'actions');

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
   * Import a path asynchronously
   * @private
   * @param importPath
   * @returns {Promise<any>}
   */
  myImport(importPath) {
    return new Promise((resolve) => {
      try {
        import(importPath).then((module) => {
          resolve({
            error: false,
            module,
          });
        });
      } catch (e) {
        resolve({
          error: e,
        });
      }
    });
  }

  /**
   *
   * @param {string} commandsPath
   * @returns void
   * @private
   */
  async loadCommands(commandsPath) {
    let promises = [];
    const files = fs.readdirSync(commandsPath).filter(f => path.extname(f) !== 'js');

    files.forEach((key) => {
      promises.push(this.myImport(path.join(commandsPath, key)));
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
          const newClass = new x.module.default();
          if (Object.getPrototypeOf(newClass.constructor).name === 'Command') {
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
  async loadDefaultCommands() {
    await this.loadCommands(this.defaultCommandPath);
  }

  /**
   * Load commands from a cutom path
   * @returns {Promise<void>}
   */
  async loadCustomCommands() {
    await this.loadCommands(this.defaultCustomCommandPath);
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
}
