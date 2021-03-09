// TODO
/*
  const { build } = require('tauri/dist/api/cli')
  build({ debug: false, config: tauriConfig })
*/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Task, yarn, TaskManagerFactory, Ctx } from '@cyn/utils';
import execa from 'execa';

export default class TauriDev extends Task {
  description = 'Start tauri in dev mode'
  id = 'tauri/dev'
  config = {}

  private tasks = TaskManagerFactory<Ctx>()

  async run(mainTask) {
    return mainTask.newListr(
      [
        {
          title: 'Tauri dev',
          task: async (ctx: Ctx, task): Promise<void> => {

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
    )
  }
}