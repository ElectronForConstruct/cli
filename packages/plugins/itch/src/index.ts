import * as path from 'path';
import fs from 'fs-extra';
import execa from 'execa'
import { Plugin, Module } from '@cyn/utils';
import envPaths from 'env-paths';

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
  project: string
  channel: string
  BUTLER_API_KEY: string
}

const butler = 'butler';

const Itch: Module<ItchCtx> = {
  description: 'Setup the directory',
  id: 'itch',
  config: {
  },

  tasks: [
    {
      title: 'Setup',
      task: async (ctx, task) => {
        try {
          const { stdout } = await execa(butler, ['-V']);
          // if (stdout.log[0][0] !== 'v') {
          //   throw new Error('Butler not found');
          // }
        } catch (error) {
          task.output = error
          throw new Error('Butler not found. Please install it from: https://itch.io/docs/butler/')
        }

        task.output = 'Finding butler'
      },
    },
    {
      title: 'Upload',
      async task(ctx, task) {
        const { project, channel, BUTLER_API_KEY } = ctx.taskSettings;
        if (!project) {
          throw new Error('You must specify a project in the itch configuration!')
        }
        if (!channel) {
          throw new Error('You must specify a channel in the itch configuration!')
        }
        if (!BUTLER_API_KEY) {
          throw new Error('You must specify an api key in the itch configuration!')
        }

        // logger.log('Publishing to itch...');
        const butlerPush = execa(butler, ['push', '.', `${project}:${channel}`], { cwd: ctx.workingDirectory})
        butlerPush.stdout?.pipe(task.stdout())
        butlerPush.stderr?.pipe(task.stdout())
        await butlerPush
        // logger.success(`${directory.channel} uploaded successfully`);
      },
    },
  ]
}

export default {
  name: 'itch',
  modules: [
    Itch,
  ]
} as Plugin