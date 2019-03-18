const { exec } = require('child_process');
const path = require('path');

module.exports = (_url, tmpDir) => new Promise(async (resolve) => {
  let url = _url;

  if (url === '.') {
    url = null;
  }

  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  process.chdir(tmpDir);

  const electron = path.join(tmpDir, 'node_modules', 'electron', 'dist', 'electron.exe');

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
