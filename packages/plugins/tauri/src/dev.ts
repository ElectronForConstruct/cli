import { yarn, Module } from '@cyn/utils';
import execa from 'execa';

export default {
  description: 'Start tauri in dev mode',
  input: {},
  output: {},
  async run(ctx) {
      // task.output = 'workingDirectory' + mainCtx.workingDirectory

      const tauriDevCmd = execa('node', [yarn, 'tauri', 'dev'], { cwd: ctx.workingDirectory })
      tauriDevCmd.stdout?.pipe(process.stdout)
      tauriDevCmd.stderr?.pipe(process.stderr)
      await tauriDevCmd
  }
} as Module<any>