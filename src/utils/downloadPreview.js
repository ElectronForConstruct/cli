const fs = require('fs');
const os = require('os');
const path = require('path');
const got = require('got');

const logger = require('../utils/console').normal('system');

module.exports = async (fullPath) => {
  const { body } = await got.get('https://api.github.com/repos/ElectronForConstruct/preview/releases/latest', {
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
    json: true,
  });

  let assetUrl;
  let exeName;
  switch (os.platform()) {
    case 'darwin':
      assetUrl = body.assets.find(asset => asset.name === 'preview-mac').browser_download_url;
      exeName = 'preview';
      break;

    case 'linux':
      assetUrl = body.assets.find(asset => asset.name === 'preview.linux').browser_download_url;
      exeName = 'preview';
      break;

    case 'win32':
      assetUrl = body.assets.find(asset => asset.name === 'preview-windows.exe').browser_download_url;
      exeName = 'preview.exe';
      break;

    default:
      logger.log('No preview script available for your platform');
  }

  const prom = new Promise((resolve) => {
    got.stream(assetUrl).pipe(fs.createWriteStream(
      path.join(fullPath, exeName),
    )).on('finish', () => {
      resolve(true);
    });
  });

  return prom;
};
