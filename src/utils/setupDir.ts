import * as path from 'path';
import * as os from 'os';

// const AdmZip = require('adm-zip');
import fs from 'fs-extra';
import extract from 'extract-zip';

import installPkg from './installPackages';
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
  settings: any,
  zipFile: string | null = null,
  mode: string,
): Promise<string> {
  const { electron } = settings;

  // create temporary directory
  const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);
  await fs.ensureDir(tmpDir);

  // copy local files from template to tmpdir
  await fs.copy(path.join(__dirname, '../', 'template'), tmpDir);

  await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(settings)}`, 'utf8');

  if (zipFile) {
    await extractZip(zipFile, tmpDir);
  } else {
    // copy app/* to root of temp dir
    await fs.copy(path.join(process.cwd(), 'app'), tmpDir);
  }

  // editing package.json
  const pkg = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8');
  const pkgJson = JSON.parse(pkg);

  if (mode === 'build') {
    pkgJson.devDependencies = {};
  } else {
    pkgJson.devDependencies.electron = electron;
  }

  pkgJson.name = settings.project.name;
  pkgJson.version = settings.project.version;
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson), 'utf8');

  if (settings.dependencies && settings.dependencies.length > 0) {
    await installPkg(settings.dependencies, tmpDir);
  } else {
    await installPkg([], tmpDir);
  }

  return tmpDir;
}

export default setupDir;
