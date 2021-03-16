import { yarn, Module } from '@cyn/utils';
import execa from 'execa';

export default {
  description: 'Start tauri in dev mode',
  id: 'tauri/dev',
  config: {},

  tasks: [
    {
      title: 'Tauri dev',
      task: async (ctx, task): Promise<void> => {

        // task.output = 'workingDirectory' + mainCtx.workingDirectory

        const tauriDevCmd = execa('node', [yarn, 'tauri', 'dev'], { cwd: ctx.workingDirectory })
        tauriDevCmd.stdout?.pipe(task.stdout())
        tauriDevCmd.stderr?.pipe(task.stdout())
        await tauriDevCmd
      },
      options: {
        bottomBar: 5
      }
    },
  ],
} as Module