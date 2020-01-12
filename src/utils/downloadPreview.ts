import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import got from 'got';
import { promisify } from 'util';
import * as stream from 'stream';
import { createNormalLogger } from './console';

const pipeline = promisify(stream.pipeline);

interface ReleaseAsset {
  url: string;
  id: number;
  name: string;
  browser_download_url: string;
}

interface ReleaseResultBody {
  assets: ReleaseAsset[];
}

const logger = createNormalLogger('system');

export default async function (fullPath: string): Promise<boolean> {
  const body: ReleaseResultBody = await got
    .get(
      'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
      {
        headers: {
          'User-Agent': 'ElectronForContruct',
        },
      },
    )
    .json();


  let assetUrl = '';
  let exeName = '';

  switch (os.platform()) {
    case 'darwin':
      assetUrl = body.assets.find((asset) => asset.name === 'preview-mac')?.browser_download_url || '';
      exeName = 'preview';
      break;

    case 'linux':
      assetUrl = body.assets.find((asset) => asset.name === 'preview-linux')?.browser_download_url || '';
      exeName = 'preview';
      break;

    case 'win32':
      assetUrl = body.assets.find((asset) => asset.name === 'preview-windows.exe')?.browser_download_url || '';
      exeName = 'preview.exe';
      break;

    default:
      logger.log('No preview script available for your platform');
  }

  if (assetUrl !== '') {
    const result = await pipeline(
      got.stream(assetUrl),
      fs.createWriteStream(
        path.join(fullPath, exeName),
      ),
    );

    // if (result) {
    return true;
    // }
  }

  return false;
}
