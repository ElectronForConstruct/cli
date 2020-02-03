import * as path from 'path';
import * as os from 'os';

// const AdmZip = require('adm-zip');
import fs from 'fs-extra';
import extract from 'extract-zip';

import installPkg from './installPackages';
import { Settings } from '../models';
// import { createNormalLogger } from './console';

// const log = createNormalLogger('build');

async function extractZip(from: string, to: string): Promise<string> {
  return new Promise((resolve, reject) => {
    extract(from, { dir: to }, (err) => {
      if (err) {
        reject(err);
      }
      resolve(to);
    });
  });
}

async function setupDir(
  settings: Settings,
  mode: 'preview' | 'build',
): Promise<string> {
  const { electron } = settings;

  // create temporary directory
  const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);
  console.log(tmpDir);
  await fs.ensureDir(tmpDir);

  // copy local files from template to tmpdir
  await fs.copy(path.join(__dirname, '..', '..', 'templates', 'runtime'), tmpDir);

  await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(settings)}`, 'utf8');

  if (mode === 'build') {
    await installPkg([], tmpDir);
  } else if (electron) {
    await installPkg([`electron@${electron}`], tmpDir, true);
  } else {
    await installPkg(['electron'], tmpDir, true);
  }

  return tmpDir;
}

export default setupDir;
