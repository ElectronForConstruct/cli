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
  async load(configPath = process.cwd()) {
    let customConfig = {};

    const search = [
      path.join(configPath, 'config.js'),
      path.join(process.cwd(), 'config.js'),
      path.join(__dirname, 'config.js'),
    ];

    search.some((p) => {
      if (fs.existsSync(p)) {
        customConfig = require(p);
        return true;
      }
      return false;
    });



    return {
      mixed: deepmerge(defaultConfig, customConfig),
      base: defaultConfig,
      user: customConfig,
    };
  }
};
