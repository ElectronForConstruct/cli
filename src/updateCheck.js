// check CLI
const checkForUpdate = async () => {
  const p = require('phin');
  const semver = require('semver');
  const chalk = require('chalk');
  const box = require('./box');
  const pkg = require('../package.json');

  let update = false;

  try {
    const res = await p({
      url: 'https://registry.npmjs.org/%40efc%2Fcli',
      parse: 'json',
    });

    if (!res || !res['dist-tags'] || !res['dist-tags'].latest) {
      return;
    }

    const { latest } = res['dist-tags'];

    if (semver.lt(pkg.version, latest)) {
      update = latest;
    }

    if (update) {
      console.log(box(`
  ${chalk.redBright('You are using an outdated version of this tool')}
      
  The latest version is ${chalk.yellow.bold.underline(update)}.
  Update using ${chalk.reset.bold.underline(`npm i -g ${pkg.name}`)}`));
    }
    return;
  } catch (e) {
    console.log('Unable to check for updates... Please check your connection and try again');
  }
};

module.exports = {
  checkForUpdate,
};
