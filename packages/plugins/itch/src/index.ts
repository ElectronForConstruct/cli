import * as path from 'path';
import os from 'os';
// import fs from 'fs-extra';
import execa from 'execa'
import { Ctx, Plugin, createPlugin } from '@cyn/utils';

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
  return new Promise((resolve) => {
    const npmstart = execa(command);

    if (npmstart && npmstart.stdout && npmstart.stderr) {
      npmstart.stdout.on('data', (data: Buffer) => {
        try {
          const json: ItchIoLogger = JSON.parse(data.toString()) as ItchIoLogger;

          if (json.type === 'log') {
            log.push(json.message);
            if (shouldLog) {
              // logger.info(json.message);
            }
          } else if (json.type === 'progress') {
            log.push(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
            if (shouldLog) {
              // logger.info(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
            }
          }
        } catch (e) {
          //
        }
      });

      npmstart.stderr.on('data', (data: Buffer) => {
        log.push(data.toString());
        if (shouldLog) {
          // logger.info(data.toString());
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

interface ItchCtx {
  project: string | null
  directories: {
    name: string
    channel: string
  }[]
}

const Itch: Plugin<ItchCtx> = {
  description: 'Setup the directory',
  id: 'itch',
  config: {},

  tasks: [{
    title: 'Tauri setup',
    task: async (ctx, task) => {
      /* const butler = 'butler';

      const result = await exe(`${butler} -V`, false);
      if (result.log[0][0] !== 'v') {
        throw new Error('Butler not found');
      }

      const { project, directories } = ctx.taskSettings;
      if (!project) {
        throw new Error('You must specify a project in the itch configuration!')
      }

      let uploaded = false;
      for (let i = 0; i < directories.length; i += 1) {
        const directory = directories[i];

        const outDir = path.resolve(process.cwd(), directory.name);

        if (outDir === workingDirectory) {
          // logger.log('Publishing to itch...');
          await exe(`${butler} push ${outDir} ${project}:${directory.channel} -j`, true);
          // logger.success(`${directory.channel} uploaded successfully`);
          uploaded = true;
        }
      }

      if (!uploaded) {
        // logger.warn(`No match found in configuration for "${workingDirectory}". Skipping.`);
      } */

      // // add tauri package
      // const yarnAddTauriCmd = execa('node', [yarn, 'add', 'tauri'], { cwd: output})
      // yarnAddTauriCmd.stdout?.pipe(task.stdout())
      // yarnAddTauriCmd.stderr?.pipe(task.stdout())
      // await yarnAddTauriCmd
    },
    options: {
      bottomBar: 5,
    }
  }]
}

export default Itch