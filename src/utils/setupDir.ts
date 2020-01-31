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

  // if (zipFile) {
  //   await extractZip(zipFile, tmpDir);
  // } else {
  //   // copy app/* to root of temp dir
  //   await fs.copy(path.join(process.cwd(), 'app'), tmpDir);
  // }

  // editing package.json
  // const pkg = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8');
  // const pkgJson = JSON.parse(pkg);

  if (mode === 'build') {
    await installPkg([], tmpDir);
  } else if (electron) {
    await installPkg([`electron@${electron}`], tmpDir, true);
  } else {
    await installPkg(['electron'], tmpDir, true);
  }

  // pkgJson.name = settings.project?.name ?? 'Cyn';
  // pkgJson.version = settings.project?.version ?? '1.0.0';
  // fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson), 'utf8');

  return tmpDir;
}

export default setupDir;
