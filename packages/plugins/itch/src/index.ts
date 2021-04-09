import execa from 'execa'
import { Plugin, Module } from '@cyn/utils';

const butler = 'butler';

const Itch: Module<any> = {
  description: 'Itch.io release upload',
  input: {
    project: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      required: true
    },
    BUTLER_API_KEY: {
      type: String,
      required: true
    }
  },
  output: {
    project: {
      type: String,
      required: true
    }
  },

  run: async (ctx) => {
    console.log('ctx', ctx)

    try {
      await execa(butler, ['-V']);
    } catch (error) {
      // task.output = error
      console.log(error)
      throw new Error('Butler not found. Please install it from: https://itch.io/docs/butler/')
    }

    // task.output = 'Finding butler'
    console.log('Finding butler')

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

    // const butlerPush = execa(butler, ['push', '.', `${project}:${channel}`], { cwd: ctx.workingDirectory})
    // butlerPush.stdout?.pipe(process.stdout)
    // butlerPush.stderr?.pipe(process.stderr)
    // await butlerPush

    return {
      project
    }
  }
}

export default {
  'itch': Itch
} as Plugin