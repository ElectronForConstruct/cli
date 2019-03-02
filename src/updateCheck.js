const request = require('request');
const semver = require('semver');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const ConfigLoader = require('./ConfigLoader');

const configLoader = new ConfigLoader();

// check CLI
const checkForUpdate = () => new Promise((resolve, reject) => {
  request('https://api.npms.io/v2/package/@electronforconstruct%2fcli', { json: true }, (error, response, body) => {
    if (error) reject(error);

    const { metadata } = body.collected;
    if (semver.lt(pkg.version, metadata.version)) resolve(metadata);
    resolve(false);
  });
});

// check template
const isNewTemplateVersionAvailable = async () => {
  const config = await configLoader.load();

  const dl = () => new Promise((resolve) => {
    request.get({
      url: `https://raw.githubusercontent.com/ElectronForConstruct/template/${config.project.branch}/template/package.json`,
      json: true,
    }, (e, r, remotePkg) => {
      resolve(remotePkg);
    });
  });

  const remotePkg = await dl();
  const remoteVersion = remotePkg.version;
  // console.log('remoteVersion', remoteVersion);

  if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    const { version: localVersion } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
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
