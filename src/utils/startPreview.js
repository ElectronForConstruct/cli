import { exec } from 'child_process';
import process from 'process';
import { npm } from '../utils';

export default url => new Promise((resolve) => {
  console.log(`Starting preview ${url ? `on "${url}"` : ''}`);

  let command;
  if (url) {
    command = `${npm} run start -- ${url}`;
  } else {
    command = `${npm} run start`;
  }

  const npmstart = exec(command, {
    cwd: process.cwd(),
  });

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
