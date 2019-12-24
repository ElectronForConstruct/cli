import { exec } from 'child_process';
import * as path from 'path';
import { createNormalLogger } from './console';

const logger = createNormalLogger('system');

async function installPackages(
  packages: string[] = [],
  cwd: string = process.cwd(),
): Promise<boolean> {
  return new Promise((resolve) => {
    const yarn = path.join(__dirname, '..', '3rd-party', 'yarn.js');
    let command = `node "${yarn}" --cwd="${cwd}"`;
    if (packages.length > 0) {
      command += ` add ${packages.join(' ')}`;
    }

    const yarnCmd = exec(command);


    if (yarnCmd && yarnCmd.stderr && yarnCmd.stdout) {
      yarnCmd.stdout.on('data', (data) => {
        logger.info(data.toString().trim());
      });

      yarnCmd.stderr.on('data', (data) => {
        logger.info(data.toString().trim());
      });
    }

    yarnCmd.on('exit', (code) => {
      if (code === 0) {
        logger.success('Packages installed successfully');
      } else {
        logger.error(`There was an error installing packages: ${code}`);
      }
      resolve(true);
    });
  });
}

export default installPackages;
