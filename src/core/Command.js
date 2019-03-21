/**
 * @type {module.Command}
 */
module.exports = class Command {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shortcut
   */
  constructor(id, name, shortcut) {
    this.name = name;
    this.rawName = name;
    this.name = name;
    this.id = id;
    this.shortcut = shortcut;
    this.desciption = '';

    if (this.shortcut) {
      const index = this.name.toLowerCase().indexOf(this.shortcut);
      if (index !== -1) {
        this.name = this.name.replace(new RegExp(this.name[index], 'igm'), `${this.underline('$&')}`);
      }
    }

    this.category = 'Other';
    this.config = {};
    this.defaultConfiguration = {};

    /** @type {Array<Command>} */
    this.modules = [];
  }

  /**
   * @private
   * @param text
   * @returns {string}
   */
  underline(text) {
    return `\u001B[4m${text}\u001B[24m`;
  }

  /**
   * Hook executed before the build task
   * @abstract
   */
  // onPreBuild() {}

  /**
   * Hook executed after the build task
   * @abstract
   */
  // onPostBuild() {}

  /**
   * Set the category of the plugin
   * @param {string} category
   */
  setCategory(category) {
    this.category = category;
  }

  setDescription(description) {
    this.description = description;
  }

  /**
   * Set the configuration context for the plugin
   * @param config
   */
  setConfig(config) {
    this.config = config;
  }

  /**
   * Set loaded modules
   * @param modules
   */
  setModules(modules) {
    this.modules = modules;
  }

  /**
   * Set default command Configuration
   * @param config
   * @abstract
   */
  setDefaultConfiguration(config) {
    this.defaultConfiguration = config;
  }

  isVisible() {
    return this.config.isProject;
  }

  /**
   * @abstract
   */
  onLoad() {
    // do nothing
  }

  get settings() {
    const { mixed } = this.config;
    return mixed;
  }

  /**
   * Used to determine if the class is valid when loading getCommands
   * @returns {boolean}
   * @abstract
   */
  isValid() {
    return true;
  }

  /**
   * @abstract
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line
  async run(args = []) {
    // :)
    console.log('This plugin does not implement any methods!');
  }
};
