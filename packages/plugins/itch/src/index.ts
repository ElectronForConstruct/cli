import execa from 'execa'
import { Plugin, Module } from '@cyn/utils';

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
          await execa(butler, ['-V']);
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

        const butlerPush = execa(butler, ['push', '.', `${project}:${channel}`], { cwd: ctx.workingDirectory})
        butlerPush.stdout?.pipe(task.stdout())
        butlerPush.stderr?.pipe(task.stdout())
        await butlerPush
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