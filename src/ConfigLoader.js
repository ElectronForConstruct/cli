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
      path.join(__dirname, 'config.js'),
    ];

    let found = false;
    search.some((p) => {
      // console.log(`Looking for config.js inside:${p}`);

      if (fs.existsSync(p)) {
        // eslint-disable-next-line
        customConfig = require(p);

        // console.log(`Config found at ${p}`);

        found = true;
        return found;
      }
      return false;
    });

    if (!found) {
      console.error('No custom configuration files where found.');
    }

    return deepmerge(defaultConfig, customConfig);
  }
};
