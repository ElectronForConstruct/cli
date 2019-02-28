import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'request';

export default async fullPath => new Promise((resolve) => {
  request({
    url: 'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
    headers: {
      'User-Agent': 'ElectronForContruct',
    },
  }, (error, response, body) => {
    const json = JSON.parse(body);

    let assetUrl;
    let exeName;
    switch (os.platform()) {
      case 'darwin':
        assetUrl = json.assets.find(asset => asset.name === 'preview-mac').browser_download_url;
        exeName = 'preview';
        break;

      case 'linux':
        assetUrl = json.assets.find(asset => asset.name === 'preview.linux').browser_download_url;
        exeName = 'preview';
        break;

      case 'win32':
        assetUrl = json.assets.find(asset => asset.name === 'preview-windows.exe').browser_download_url;
        exeName = 'preview.exe';
        break;

      default:
        console.log('No preview script available for your platform');
        return;
    }

    request(assetUrl).pipe(fs.createWriteStream(
      path.join(fullPath, exeName),
    )).on('finish', () => {
      resolve(true);
    });
  });
});
