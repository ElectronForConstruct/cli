import * as path from 'path';
import { exec } from 'child_process';
import { createScopedLogger } from '@cyn/utils';

interface Config {
  project: string | null
  directories: {
    name: string
    channel: string
  }[]
}

const config: Config = {
  project: null,
  directories: [],
};

interface ItchIoLogger {
  type: string
  message: string
  progress: number
  eta: string
}

const exe = async (
  command: string,
  shouldLog = true,
): Promise<{ code: string; log: string[] }> => {
  const log: string[] = [];
  const logger = createScopedLogger('itch', {
    interactive: true,
  });
  return new Promise((resolve) => {
    const npmstart = exec(command);

    if (npmstart && npmstart.stdout && npmstart.stderr) {
      npmstart.stdout.on('data', (data: Buffer) => {
        try {
          const json: ItchIoLogger = JSON.parse(data.toString()) as ItchIoLogger;

          if (json.type === 'log') {
            log.push(json.message);
            if (shouldLog) {
              logger.info(json.message);
            }
          } else if (json.type === 'progress') {
            log.push(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
            if (shouldLog) {
              logger.info(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
            }
          }
          // logger.log(data.toString());
        } catch (e) {
          //
        }
      });

      npmstart.stderr.on('data', (data: Buffer) => {
        log.push(data.toString());
        if (shouldLog) {
          logger.info(data.toString());
        }
      });

      npmstart.on('exit', (code) => {
        resolve({
          code: (code ?? '').toString(),
          log,
        });
      });
    }
  });
};

export default {
  description: 'Publish to Itch.io',
  name: 'itch',
  config,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  run: async function run({
      workingDirectory,
      taskSettings
  }: {
      workingDirectory: string,
      taskSettings: Config
  }): Promise<any> {
    const logger = createScopedLogger('itch', {
      interactive: true,
    });

    const butler = 'butler';

    const result = await exe(`${butler} -V`, false);
    if (result.log[0][0] !== 'v') {
      logger.error('Butler not found');
    }

    // console.log('workingDirectory', workingDirectory);

    const { project, directories } = taskSettings as Config;
    if (!project) {
      logger.error('You must specify a project in the itch configuration!');
      return {
        error: true,
        sources: [],
      };
    }

    // console.log('directories', directories);

    let uploaded = false;
    for (let i = 0; i < directories.length; i += 1) {
      const directory = directories[i];

      const outDir = path.resolve(process.cwd(), directory.name);

      if (outDir === workingDirectory) {
        logger.log('Publishing to itch...');
        await exe(`${butler} push ${outDir} ${project}:${directory.channel} -j`, true);
        logger.success(`${directory.channel} uploaded successfully`);
        uploaded = true;
      }
    }

    if (!uploaded) {
      logger.warn(`No match found in configuration for "${workingDirectory}". Skipping.`);
    }

    return {
      sources: [workingDirectory],
    };
  },
}
