import chalk from 'chalk';

export default class Command {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shortcut
   */
  constructor(id, name, shortcut) {
    this.name = name;
    this.id = id;
    this.shortcut = shortcut;

    if (this.shortcut) {
      const index = this.name.toLowerCase().indexOf(this.shortcut);
      if (index !== -1) {
        this.name = this.name.replace(new RegExp(this.name[index], 'igm'), chalk.underline(this.name[index]));
      }
    }

    this.category = 'Other';
    this.config = {};
  }

  /**
   * Set the category of the plugin
   * @param {string} category
   */
  setCategory(category) {
    this.category = category;
  }

  /**
   * Set the configuration context for the plugin
   * @param config
   */
  setConfig(config) {
    this.config = config;
  }

  show() {
    return this.config.isReady && this.config.isElectron;
  }

  onLoad() {
    // do nothing
  }

  /**
   * Used to determine if the class is valid when loading commands
   * @returns {boolean}
   */
  isValid() {
    return true;
  }

  async run() {
    throw new Error('You must define an async run command!');
  }
}
