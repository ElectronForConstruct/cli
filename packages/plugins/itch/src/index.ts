import { Node } from '@cyn/core';

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

    this.addInputInterface(INPUT_FOLDER, "StringOption", '');
    this.addInputInterface(INPUT_FLOW, "StringOption", '');

    this.addInputInterface(PROJECT, "StringOption", '');
    this.addInputInterface(CHANNEL, "StringOption", '');
    this.addInputInterface(API_KEY, "StringOption", '');

    // this.addOption("Operation", "SelectOption", "Add", undefined, {
    //   items: ["Add", "Subtract"]
    // });
    this.addOutputInterface(OUTPUT_FOLDER);
    this.addOutputInterface(OUTPUT_FLOW);
  }

  async run(props: InputType, ctx: any) {
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

    const { project, channel, BUTLER_API_KEY } = props;
    if (!project) {
      throw new Error('You must specify a project in the itch configuration!')
    }
    if (!channel) {
      throw new Error('You must specify a channel in the itch configuration!')
    }
    if (!BUTLER_API_KEY) {
      throw new Error('You must specify an api key in the itch configuration!')
    }

    const butlerPush = execa(butler, ['push', '.', `${project}:${channel}`], { cwd: ctx.cwd})
    butlerPush.stdout?.on('data', (data) => {
      console.log(data.toString())
    })
    butlerPush.stderr?.on('data', (data) => {
      console.log(data.toString())
    })

    await butlerPush

    return {
      project,
    }
  }
}

export const itch = Itch
export const INPUT_FLOW = "In"
export const OUTPUT_FLOW = "Out"
export const INPUT_FOLDER = "Input Folder"
export const OUTPUT_FOLDER = "Output Folder"
export const PROJECT = "Project"
export const CHANNEL = "Channel"
export const API_KEY = "API Key"