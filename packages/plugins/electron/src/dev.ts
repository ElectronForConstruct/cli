import { Module, yarn } from '@cyn/utils';
import execa from 'execa';

export default {
  description: 'Dev',
  input: {},
  output: {},
  async run(ctx) {
    const install = execa('node', [yarn, 'electron', '.'], { cwd: ctx.workingDirectory })
    install.stdout?.pipe(process.stdout)
    install.stderr?.pipe(process.stderr)
    await install
  }
} as Module<any>