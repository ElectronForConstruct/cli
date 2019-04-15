const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
// const AdmZip = require('adm-zip');
const shelljs = require('shelljs');
const extract = require('extract-zip');
const install = require('install-packages');

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
 * @param settings
 * @returns {Promise<string>}
 */
module.exports = async (settings, zipFile = null) => {
  console.log(settings);
  const { electron } = settings;

  // create temporary directory
  tmp.setGracefulCleanup();
  const tmpDir = tmp.dirSync({
    prefix: 'efc_',
    unsafeCleanup: true,
  });

  if (
    fs.existsSync(path.join(process.cwd(), 'cache', 'package-lock.json'))
  ) {
    console.log('Using cache');
    shelljs.cp(path.join(process.cwd(), 'cache', 'package-lock.json'), path.join(tmpDir.name, 'package-lock.json'));
  }

  if (fs.existsSync(path.join(process.cwd(), 'cache', 'yarn.lock'))) {
    console.log('Using cache');
    shelljs.cp(path.join(process.cwd(), 'cache', 'yarn.lock'), path.join(tmpDir.name, 'yarn.lock'));
  }

  // copy local files from template to tmpdir
  shelljs.cp(path.join(__dirname, '../../', 'template', 'main.js'), tmpDir.name);
  shelljs.cp(path.join(__dirname, '../../', 'template', 'preload.js'), tmpDir.name);
  shelljs.cp(path.join(__dirname, '../../', 'template', 'package.json'), tmpDir.name);

  fs.writeFileSync(path.join(tmpDir.name, 'config.js'), `module.exports = ${JSON.stringify(settings, null, '  ')}`, 'utf8');

  if (zipFile) {
    await extractZip(zipFile, tmpDir.name);
  } else {
    // copy app/* to root of temp dir
    shelljs.cp('-R', path.join(process.cwd(), 'app', '*'), tmpDir.name);
  }

  // shelljs.cp(path.join(process.cwd(), 'config.js'), tmpDir.name);

  // editing package.json
  const pkg = fs.readFileSync(path.join(tmpDir.name, 'package.json'), 'utf8');
  const pkgJson = JSON.parse(pkg);
  pkgJson.devDependencies.electron = electron;
  pkgJson.name = settings.project.name;
  pkgJson.version = settings.project.version;
  fs.writeFileSync(path.join(tmpDir.name, 'package.json'), JSON.stringify(pkgJson, null, '\t'), 'utf8');

  if (settings.dependencies && settings.dependencies.length > 0) {
    await install({
      cwd: tmpDir.name,
      packages: settings.dependencies,
    });
  } else {
    await install({
      cwd: tmpDir.name,
    });
  }

  // Cache ///
  shelljs.mkdir('-p', path.join(process.cwd(), 'cache'));

  if (fs.existsSync(path.join(tmpDir.name, 'package-lock.json'))) {
    console.log('Caching files to speed up next builds');
    shelljs.cp(path.join(tmpDir.name, 'package-lock.json'), path.join(process.cwd(), 'cache'));
  }

  if (fs.existsSync(path.join(tmpDir.name, 'yarn.lock'))) {
    console.log('Caching files to speed up next builds');
    shelljs.cp(path.join(tmpDir.name, 'yarn.lock'), path.join(process.cwd(), 'cache'));
  }
  // ~ Cache ///

  return tmpDir.name;
};
