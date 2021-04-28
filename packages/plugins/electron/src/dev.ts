import { Module, yarn } from '@cyn/utils';
import execa from 'execa';

export default class extends Module<any, any> {
  description = 'Dev'
  inputs = {}

  async run(ctx: any) {
    const install = execa('node', [yarn, 'electron', '.'], { cwd: this.cwd })
    install.stdout?.pipe(process.stdout)
    install.stderr?.pipe(process.stderr)
    await install
  }
}