import { exec } from 'child_process';
import * as path from 'path';
import { createScopedLogger } from '@cyn/utils';

const logger = createScopedLogger('system', {
  interactive: true,
});

async function installPackages(
  packages: string[][] = [],
  cwd: string = process.cwd(),
  dev = false,
): Promise<boolean> {
  return new Promise((resolve) => {
    const yarn = path.join(__dirname, '..', '..', 'lib', 'yarn-1.22.4.js');

    let command = `node "${yarn}" --cwd="${cwd}"`;
    if (packages.length > 0) {
      command += ` add ${dev ? '-D ' : ' '}`;

      packages.forEach((pkg: string[]) => {
        command +=  pkg.join(pkg.length === 2 ? '@' : '') + ' '
      })
    }

    // console.log('command', command)

    const yarnCmd = exec(command);

    if (yarnCmd && yarnCmd.stderr && yarnCmd.stdout) {
      yarnCmd.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n')
        lines.forEach((line: string) => {
          logger.info(line);
        });
      });

      yarnCmd.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n')
        lines.forEach((line: string) => {
          logger.info(line);
        });
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
