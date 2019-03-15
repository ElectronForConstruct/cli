const { exec } = require('child_process');
const path = require('path');
const install = require('install-packages');
// const electron = require('electron');

module.exports = _url => new Promise(async (resolve) => {
  let wd = process.cwd();
  let url = _url;

  if (url === '.') {
    wd = path.resolve(url);
    url = null;
  }

  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  const templateFolder = path.join(__dirname, '../..', 'template');

  process.chdir(templateFolder);

  await install({
    cwd: templateFolder,
  });


  const electron = path.join(templateFolder, 'node_modules', 'electron', 'dist', 'electron.exe');

  const command = `${electron} ${templateFolder} ${url ? `--url=${url}` : ''} --wd=${wd}`;

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
