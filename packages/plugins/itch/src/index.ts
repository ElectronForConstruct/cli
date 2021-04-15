import execa from 'execa'
import { Module } from '@cyn/utils';

const butler = 'butler';

interface InputType {
  project: string;
  channel: string;
  BUTLER_API_KEY: string;
}

interface OutputType {
  project: string,
  result: number
}

const Itch: Module<InputType, OutputType> = {
  id: 'itch',
  description: 'Itch.io release upload',

  // inputs = {
  //   project: createInput<string>(),
  //   channel: createInput<string>(),
  //   BUTLER_API_KEY: createInput<string>(),
  // }

  inputs: {
    project: 'aaa',
    channel: 'aaa',
    BUTLER_API_KEY: 'aaa'
  },

  async run (ctx) {
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
      project,
      result: 0
    }
  }
}

export const itch = Itch