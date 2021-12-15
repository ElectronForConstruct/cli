import { yarn, Node } from '@cyn/core';

export class Dev extends Node {
  type = 'electron-dev'
  name = 'Build folder using Electron'

  constructor() {
    super();

    this.addInputInterface(INPUT_FLOW)
    this.addInputInterface(INPUT_FOLDER, "StringOption", '', {

    });
    this.addOutputInterface(OUTPUT_FOLDER);
    this.addOutputInterface(OUTPUT_FLOW);
  }

  async run(props: any, ctx: any) {
    const yarnPath = await yarn();
    const execa = (await import('execa')).default;
    const install = execa('node', [yarnPath, 'electron', '.'], { cwd: ctx.cwd })
    install.stdout?.pipe(process.stdout)
    install.stderr?.pipe(process.stderr)
    await install
  }
}

export const INPUT_FOLDER = "Input Folder"
export const INPUT_FLOW = "In"
export const OUTPUT_FLOW = "Out"
export const OUTPUT_FOLDER = "Output Folder"