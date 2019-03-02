import fs from 'fs';
import path from 'path';
import * as deepmerge from 'deepmerge';
import defaultConfig from './DefaultConfig';

export default class ConfigLoader {
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

    const overwriteMerge = (destinationArray, sourceArray) => sourceArray;
    return deepmerge.default(defaultConfig, customConfig, { arrayMerge: overwriteMerge });
  }
}
