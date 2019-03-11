const request = require('request');
const semver = require('semver');
const fs = require('fs');
const { USER_PACKAGE_JSON } = require('./utils/ComonPaths');
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
    console.log(latest);

    if (semver.lt(pkg.version, latest)) resolve(latest);
    resolve(false);
  });
});

// check template
const isNewTemplateVersionAvailable = async (settings) => {
  const dl = () => new Promise((resolve) => {
    request.get({
      url: `https://raw.githubusercontent.com/ElectronForConstruct/template/${settings.project.branch}/template/package.json`,
      json: true,
    }, (e, r, remotePkg) => {
      resolve(remotePkg);
    });
  });

  const remotePkg = await dl();
  const remoteVersion = remotePkg.version;
  // console.log('remoteVersion', remoteVersion);

  if (fs.existsSync(USER_PACKAGE_JSON)) {
    const { version: localVersion } = JSON.parse(fs.readFileSync(USER_PACKAGE_JSON, 'utf8'));
    // console.log('localVersion', localVersion);

    if (semver.lt(localVersion, remoteVersion)) {
      // console.log('An update is available');
      return {
        local: localVersion,
        remote: remoteVersion,
      };
    }
  }
  return null;
};

module.exports = {
  checkForUpdate,
  isNewTemplateVersionAvailable,
};
