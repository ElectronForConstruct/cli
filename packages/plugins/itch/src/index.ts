import { Module, Plugin, Node } from '@cyn/core';

const butler = 'butler';

interface InputType {
  project: string;
  channel: string;
  BUTLER_API_KEY: string;
}

interface OutputType {
  project: string,
}

class Itch extends Node {
  type = 'itch'
  name = 'Itch.io release upload'

  constructor() {
    super();

    this.addInputInterface("Project", "StringOption", '');
    this.addInputInterface("Channel", "StringOption", '');
    this.addInputInterface("API Key", "StringOption", '');

    // this.addOption("Operation", "SelectOption", "Add", undefined, {
    //   items: ["Add", "Subtract"]
    // });
    this.addOutputInterface("Folder");
  }

  async run(ctx: InputType) {
    const execa = (await import ('execa')).default
    try {
      await execa(butler, ['-V']);
    } catch (error) {
      // task.output = error
      console.log(error)
      throw new Error('Butler not found. Please install it from: https://itch.io/docs/butler/')
    }

    // task.output = 'Finding butler'
    console.log('Finding butler')

    const { project, channel, BUTLER_API_KEY } = ctx;
    if (!project) {
      throw new Error('You must specify a project in the itch configuration!')
    }
    if (!channel) {
      throw new Error('You must specify a channel in the itch configuration!')
    }
    if (!BUTLER_API_KEY) {
      throw new Error('You must specify an api key in the itch configuration!')
    }

    const butlerPush = execa(butler, ['push', '.', `${project}:${channel}`], { cwd: this.cwd})
    butlerPush.stdout?.on('data', (data) => {
      this.logger.log(data.toString())
    })
    butlerPush.stderr?.on('data', (data) => {
      this.logger.log(data.toString())
    })

    await butlerPush

    return {
      project,
    }
  }
}

export const itch = Itch

export default {
  itch: Itch
} as Plugin