const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');
const defaultConfig = require('./DefaultConfig');

module.exports = class ConfigLoader {
  /**
   * Load and merge config files
   * @async
   * @returns {Promise<Object>}
   */
  async load() {
    let customConfig = {};
    if (fs.existsSync(path.join(process.cwd(), 'config.js'))) {
      // eslint-disable-next-line
      customConfig = require(path.join(process.cwd(), 'config.js'));
    }

    return deepmerge(defaultConfig, customConfig);
  }
};
