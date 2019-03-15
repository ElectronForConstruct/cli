const request = require('request');
const semver = require('semver');
const pkg = require('../package.json');

// check CLI
const checkForUpdate = () => new Promise((resolve, reject) => {
  request('https://registry.npmjs.org/%40efc%2Fcli', { json: true }, (error, response, body) => {
    if (error) reject(error);

    if (!body || !body['dist-tags'] || !body['dist-tags'].latest) {
      console.error('Unable to check updates');
      resolve(false);
    }


    const { latest } = body['dist-tags'];

    if (semver.lt(pkg.version, latest)) resolve(latest);
    resolve(false);
  });
});

module.exports = {
  checkForUpdate,
};
