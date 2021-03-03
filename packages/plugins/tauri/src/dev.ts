// TODO
/*
  const { build } = require('tauri/dist/api/cli')
  build({ debug: false, config: tauriConfig })
*/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Task, createScopedLogger, yarn, TaskManagerFactory, Ctx } from '@cyn/utils';
import execa from 'execa';

const logger = createScopedLogger('tauri/setup', {
  interactive: false,
});

export default class TauriDev extends Task {
  description = 'Start tauri in dev mode'
  id = 'tauri/dev'
  config = {}

  private tasks = TaskManagerFactory<Ctx>()

  async run(mainCtx: Ctx, task) {
    this.tasks.ctx = mainCtx
    
    this.tasks.add(
      [
        {
          title: 'Tauri dev',
          task: async (ctx: Ctx, task): Promise<void> => {

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const settings = ctx.taskSettings as any;

          console.log('ctx.workingDirectory', ctx.workingDirectory)
          console.log('mainCtx.workingDirectory', mainCtx.workingDirectory)

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // eslint-disable-next-line @typescript-eslint/no-var-requires

          task.output = 'workingDirectory' + mainCtx.workingDirectory
          // const serve = handler(workingDirectory)

          // return new Promise((resolve, reject) => {
          //   connect()
          //   .use(serve)
          //   .listen(3000, async () => {
          //     logger.info('Server running on 3000...');
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              const tauriDevCmd = execa('node', [yarn, 'tauri', 'dev', '--cwd=' + ctx.workingDirectory])
              tauriDevCmd.stdout?.pipe(task.stdout())
              const { stdout } = await tauriDevCmd

                // distDir: 'https://preview.construct.net/#v69kfz9s',
                // devPath: 'http://localhost:7000',
              ctx.source = ctx.workingDirectory
            // })
          // });
        },
      }
      ],
      { exitOnError: true, concurrent: false, ctx: mainCtx }
    )

    return this.tasks.runAll()
  }
}