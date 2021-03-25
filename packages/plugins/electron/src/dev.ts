import { Module, yarn } from '@cyn/utils';
import execa from 'execa';

export default {
  description: 'Dev',
  id: 'electron/dev',
  config: {},
  tasks: [
    {
      title: 'Starting dev',
      async task(ctx, task) {
        const install = execa('node', [yarn, 'electron', '.'], { cwd: ctx.workingDirectory })
        install.stdout?.pipe(task.stdout())
        install.stderr?.pipe(task.stdout())
        await install
      }
    }
  ]
} as Module<any>