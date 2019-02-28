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
   * @param {Object} config
   * @returns void
   * @private
   */
  async loadCommands(commandsPath, config) {
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
            newClass.setConfig(config);
            await newClass.onLoad();
            this._commands.push(newClass);
          } else {
            console.log(`Plugin ${newClass.name} (${newClass.id}) is not a valid module. You must inherit from the Command class`);
          }
          resolve();
        }),
      );
    });

    await Promise.all(promises);
  }

  /**
   * Load default commands
   * @param {Object} config
   * @returns {Promise<void>}
   */
  async loadDefaultCommands(config = {}) {
    await this.loadCommands(this.defaultCommandPath, config);
  }

  /**
   * Load commands from a cutom path
   * @param {Object} config
   * @returns {Promise<void>}
   */
  async loadCustomCommands(config = {}) {
    await this.loadCommands(this.defaultCustomCommandPath, config);
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
