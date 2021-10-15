import { Module, yarn, Node } from '@cyn/core';

export default class extends Node {
  type = 'electron-dev'
  name = 'Start Electron dev server'

  constructor() {
    super();

    // this.addInputInterface("Project", "StringOption", '');
    // this.addInputInterface("Channel", "StringOption", '');
    // this.addInputInterface("API Key", "StringOption", '');

    // this.addOption("Operation", "SelectOption", "Add", undefined, {
    //   items: ["Add", "Subtract"]
    // });
    this.addOutputInterface("Folder");
  }

  async run(ctx: any) {
    const execa = (await import('execa')).default;
    const install = execa('node', [yarn, 'electron', '.'], { cwd: this.cwd })
    install.stdout?.pipe(process.stdout)
    install.stderr?.pipe(process.stderr)
    await install
  }
}