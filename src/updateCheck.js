const request = require('request');
const semver = require('semver');
const pkg = require('../package.json');

// check CLI
const checkForUpdate = () => new Promise((resolve) => {
  request('https://registry.npmjs.org/%40efc%2Fcli', { json: true }, (error, response, body) => {
    if (error) {
      resolve(false);
    }

    try {
      if (!body || !body['dist-tags'] || !body['dist-tags'].latest) {
        resolve(false);
      }

      const { latest } = body['dist-tags'];

      if (semver.lt(pkg.version, latest)) { resolve(latest); }
      resolve(false);
    } catch (e) {
      console.log('Unable to check for updates... Please check your connection and try again');
      resolve(false);
    }
  });
});

module.exports = {
  checkForUpdate,
};
