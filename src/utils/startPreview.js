const { exec } = require('child_process');
const path = require('path');
const download = require('electron-download');
const shelljs = require('shelljs');
const extract = require('extract-zip');
const fs = require('fs');
const os = require('os');

const cacheElectron = async version => new Promise((resolve, reject) => {
  download({
    version,
  }, (err, zipPath) => {
    if (err) reject(err);
    resolve(zipPath);
  });
});

const extractZip = async (from, to) => new Promise((resolve, reject) => {
  extract(from, { dir: to }, (err) => {
    if (err) reject(err);
    resolve(to);
  });
});

module.exports = (_url, tmpDir, electronVersion) => new Promise(async (resolve) => {
  let url = _url;

  if (url === '.') {
    url = null;
  }

  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  process.chdir(tmpDir);

  // Download electron /////////////

  /*
  const zip = await cacheElectron(electronVersion);
  console.log(zip);

  const extractPath = path.join(path.dirname(zip), electronVersion);
  console.log(extractPath);

  const macPath = path.join(extractPath, 'Electron.app', 'Contents', 'MacOS', 'Electron');
  const winPath = path.join(extractPath, 'electron.exe');
  const linuxPath = path.join(extractPath, 'electron');

  if (
    !fs.existsSync(winPath)
    && !fs.existsSync(linuxPath)
    && !fs.existsSync(macPath)
  ) {
    console.log('Extracting...');
    console.log('Download and extraction will only happen once per version.');
    console.log('Subsequent builds and preview will be significantly faster');
    shelljs.mkdir('-p', extractPath);
    await extractZip(zip, extractPath);
  }

  // ///////////////////////////////

  let electron;
  switch (os.platform()) {
    case 'darwin':
      electron = macPath;
      break;

    case 'win32':
      electron = winPath;
      break;

    case 'linux':
      electron = linuxPath;
      break;

    default:
      throw new Error('Unsupported OS');
  }
  const command = `${electron} ${tmpDir} ${url ? `--url=${url}` : ''} --wd=${tmpDir}`;
  */

  const command = `${path.join(tmpDir, 'node_modules', 'electron', 'dist', 'electron.exe')} ${tmpDir} ${url ? `--url=${url}` : ''} --wd=${tmpDir}`;

  console.log(command);

  const npmstart = exec(command);

  npmstart.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  npmstart.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString()}`);
  });

  npmstart.on('exit', (code) => {
    console.log(`Electron exited: ${code.toString()}`);
    resolve(true);
  });
});
