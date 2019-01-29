import request from 'request';
import semver from 'semver';
import pkg from '../package.json';

export default () => new Promise((resolve, reject) => {
  request('https://api.npms.io/v2/package/@electronforconstruct%2fcli', { json: true }, (error, response, body) => {
    if (error) reject(error);

    const { metadata } = body.collected;
    if (semver.lt(pkg.version, metadata.version)) resolve(metadata);
    resolve(false);
  });
});
