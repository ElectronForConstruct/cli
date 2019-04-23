const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');

const logger = require('../utils/console').normal('minifier');
const iaLogger = require('../utils/console').interactive('minifier');

const recursiveReadDir = async dir => new Promise((resolve, reject) => {
  recursive(dir, (err, files) => {
    if (err) {
      reject(err);
    }
    resolve(files);
  });
});

/**
 * @param {Settings} settings
 * @param dir
 * @return {Promise<boolean>}
 */
const myMinify = async (settings, dir) => {
  const Terser = require('terser');

  const { ignore } = settings.minifier;

  iaLogger.info('Minifying...');

  const files = await recursiveReadDir(dir);

  files.forEach((file) => {
    if (path.extname(file) === '.js' && !ignore.includes(path.basename(file)) && !file.includes('node_modules')) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');

        const { code, error } = Terser.minify(fileContent, {
          toplevel: true,
          compress: true,
        });
        if (error) { throw error; }

        fs.writeFileSync(file, code, 'utf8');
        iaLogger.await(`Minified ${path.basename(file)}`);
        return true;
      } catch (e) {
        iaLogger.error(`Failed minifying ${path.basename(file)}`);
        return false;
      }
    }
    return true;
  });

  iaLogger.success('All files minified successfuly');
  return true;
};

/**
 * @type EFCModule
 */
module.exports = {
  name: 'minifier',
  description: 'Minify files before packaging them',

  config: {
    ignore: ['data.js', 'offline.js'],
  },

  /**
   * @param args
   * @param {Settings} settings
   * @param dir
   * @return {Promise<boolean>}
   */
  async onPreBuild(args, settings, dir) {
    const done = await myMinify(settings, dir);
    return done;
  },

  async run() {
    logger.log('The minifier will run before the build step only on files that are going to be included in the final package.');
    logger.log('Please use "efc build" to run the minifier');
  },
};
