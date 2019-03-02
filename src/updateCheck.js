import request from 'request';
import semver from 'semver';
import path from 'path';
import fs from 'fs';
import pkg from '../package.json';
import ConfigLoader from './ConfigLoader';

const configLoader = new ConfigLoader();

// check CLI
export const checkForUpdate = () => new Promise((resolve, reject) => {
  request('https://api.npms.io/v2/package/@electronforconstruct%2fcli', { json: true }, (error, response, body) => {
    if (error) reject(error);

    const { metadata } = body.collected;
    if (semver.lt(pkg.version, metadata.version)) resolve(metadata);
    resolve(false);
  });
});

// check template
export const isNewTemplateVersionAvailable = async () => {
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
