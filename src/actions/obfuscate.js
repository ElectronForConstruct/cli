const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');

const logger = require('../utils/console').normal('obfuscator');
const iaLogger = require('../utils/console').interactive('obfuscator');

const recursiveReadDir = async (dir) => new Promise((resolve, reject) => {
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
  const JavaScriptObfuscator = require('javascript-obfuscator');

  const { ignore } = settings.obfuscator;

  iaLogger.info('Minifying...');

  const files = await recursiveReadDir(dir);

  files.forEach((file) => {
    if (path.extname(file) === '.js' && !ignore.includes(path.basename(file)) && !file.includes('node_modules')) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');

        const obfuscationResult = JavaScriptObfuscator.obfuscate(fileContent, {
          compact: false,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.1,
          debugProtection: false,
          debugProtectionInterval: false,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: true,
          stringArray: true,
          stringArrayEncoding: 'base64',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        });

        const code = obfuscationResult.getObfuscatedCode();

        fs.writeFileSync(file, code, 'utf8');
        iaLogger.await(`Obfuscated ${path.basename(file)}`);
        return true;
      } catch (e) {
        iaLogger.error(`Failed obfuscating ${path.basename(file)}`);
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
  name: 'obfuscator',
  description: 'Minify files before packaging them',

  config: {
    ignore: ['data.js', 'offline.js', 'c3runtime.js'],
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
    logger.log('The obfuscator will run before the build step only on files that are going to be included in the final package.');
    logger.log('Please use "efc build" to run the obfuscator');
  },
};
