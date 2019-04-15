const fs = require('fs');
const os = require('os');
const path = require('path');
const p = require('phin');

module.exports = async (fullPath) => {
  const body = await p({
    url: 'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
    parse: 'json',
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
      console.log('No preview script available for your platform');
      return;
  }

  return new Promise((resolve) => {
    p({
      url: assetUrl,
      stream: true,
    }).pipe(fs.createWriteStream(
      path.join(fullPath, exeName),
    )).on('finish', () => {
      resolve(true);
    });
  });
};
