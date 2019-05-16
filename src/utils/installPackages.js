const { exec } = require('child_process');
const path = require('path');
const logger = require('./console').interactive('system');

/**
 * Install packages using yarn
 * @param {string|Array<string>} packages
 * @param {string} cwd
 */
module.exports = async (packages = [], cwd = process.cwd()) => new Promise((resolve) => {
  const yarn = path.join(__dirname, 'yarn.js');
  let command = `node "${yarn}" --cwd="${cwd}"`;
  if (packages.length > 0) {
    command += ` add ${packages.join(' ')}`;
  }

  const yarnCmd = exec(command);

  yarnCmd.stdout.on('data', (data) => {
    logger.info(data.toString().trim());
  });

  yarnCmd.stderr.on('data', (data) => {
    logger.info(data.toString().trim());
  });

  yarnCmd.on('exit', (code) => {
    if (code === 0) {
      logger.success('Packages installed successfully');
    } else {
      logger.error(`There was an error installing packages: ${code}`);
    }
    resolve(true);
  });
});
