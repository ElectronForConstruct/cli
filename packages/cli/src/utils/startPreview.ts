import { exec } from 'child_process';
import * as path from 'path';
import os from 'os';
import { createLogger } from '@cyn/utils';

const logger = createLogger({
  scope: 'system',
});

export default (
  workingDirOrURL: string,
  tmpDir: string,
): Promise<boolean> => new Promise((resolve) => {
  logger.info(`Starting preview at "${workingDirOrURL}"`);

  // process.chdir(tmpDir);

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

  const command = `"${electron}" "${tmpDir}" "${workingDirOrURL}"`;

  const npmstart = exec(command);

  if (npmstart && npmstart.stdout && npmstart.stderr) {
    npmstart.stdout.on('data', (data) => {
      logger.info(data.toString());
    });

    npmstart.stderr.on('data', (data) => {
      logger.error(`Error: ${data.toString()}`);
    });

    npmstart.on('exit', (code) => {
      logger.info(`Electron exited: ${code?.toString()}`);
      return resolve(true);
    });
  } else {
    return resolve(false);
  }
});
