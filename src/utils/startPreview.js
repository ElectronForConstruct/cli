const { exec } = require('child_process');
const path = require('path');
const install = require('install-packages');
// const electron = require('electron');

module.exports = url => new Promise(async (resolve) => {
  if (url === '') url = process.cwd();
  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  const templateFolder = path.join(__dirname, '../..', 'template');

  process.chdir(templateFolder);

  await install({
    cwd: templateFolder,
  });

  const electron = path.join(templateFolder, 'node_modules', 'electron', 'dist', 'electron.exe');

  const command = `${electron} ${templateFolder} ${url}`;

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
