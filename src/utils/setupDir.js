const fs = require('fs');
const path = require('path');
const os = require('os');
// const AdmZip = require('adm-zip');
const shelljs = require('shelljs');
const extract = require('extract-zip');
const installPkg = require('./installPackages');
const Console = require('../utils/console');

const log = Console.normal('build');

const extractZip = async (from, to) => new Promise((resolve, reject) => {
  extract(from, { dir: to }, (err) => {
    if (err) {
      reject(err);
    }
    resolve(to);
  });
});

/**
 * Prepare a sandboxed environment in tmp
 * @param {Object} settings
 * @param zipFile
 * @returns {Promise<string>}
 */
module.exports = async (settings, zipFile = null, mode) => {
  const { electron } = settings;

  // create temporary directory
  const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);
  shelljs.mkdir('-p', tmpDir);

  // copy local files from template to tmpdir
  shelljs.cp(path.join(__dirname, '../', 'template', '*'), tmpDir);

  fs.writeFileSync(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(settings)}`, 'utf8');

  if (zipFile) {
    await extractZip(zipFile, tmpDir);
  } else {
    // copy app/* to root of temp dir
    shelljs.cp('-R', path.join(process.cwd(), 'app', '*'), tmpDir);
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
};
