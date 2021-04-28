import { yarn, Module } from '@cyn/utils';
import execa from 'execa';

export default class extends Module<any, any> {
  description = 'Start tauri in dev mode'

  inputs = {}

  async run(ctx: any) {
      // task.output = 'workingDirectory' + mainCtx.workingDirectory

      const tauriDevCmd = execa('node', [yarn, 'tauri', 'dev'], { cwd: this.cwd })
      tauriDevCmd.stdout?.pipe(process.stdout)
      tauriDevCmd.stderr?.pipe(process.stderr)
      await tauriDevCmd
  }
}