const { exec } = require('child_process');
const path = require('path');
const os = require('os');

module.exports = (_url, tmpDir) => new Promise(async (resolve) => {
  let url = _url;

  if (url === '.') {
    url = null;
  }

  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  process.chdir(tmpDir);

  const rootPath = path.join(tmpDir, 'node_modules', 'electron', 'dist');

  let electron;
  switch (os.platform()) {
    case 'darwin':
      electron = path.join(rootPath, 'Electron.app', 'Contents', 'MacOS', 'Electron');
      break;

    case 'win32':
      electron = path.join(rootPath, 'electron.exe');
      break;

    case 'linux':
      electron = path.join(rootPath, 'electron');
      break;

    default:
      throw new Error('Unsupported OS');
  }

  const command = `${electron} ${tmpDir} ${url ? `--url=${url}` : ''} --wd=${tmpDir}`;

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
