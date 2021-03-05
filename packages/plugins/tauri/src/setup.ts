import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { createScopedLogger, Ctx, Task, TaskManagerFactory, yarn } from '@cyn/utils';
import execa from 'execa'

const logger = createScopedLogger('tauri/setup', {
  interactive: false,
});

interface SetupCtx extends Ctx {
  taskSettings: {
    build: {
      distDir: string
      devPath: string
    },
    tauri: {
      window: {
        title: string
      },
      embeddedServer: {
        active: boolean
      },
      bundle: {
        identifier: string
      },
      allowlist: {
        all: boolean
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class TauriSetup extends Task {
  description = 'Setup the directory'
  id = 'tauri/setup'
  config = {}

  private tasks = TaskManagerFactory<Ctx>()

  async run(mainTask) {
    // this.tasks.ctx = mainCtx

    return mainTask.newListr([
        {
          title: 'Tauri setup',
          task: async (ctx: Ctx, task): Promise<void> => {
            const tmpDir = path.join(os.tmpdir(), `cyn_tauri_${path.basename(process.cwd())}`);
            

            // copy input folder to temp
            const output = path.join(tmpDir)
            const input = path.join(process.cwd(), ctx.workingDirectory)
            await fs.copy(input, output, { overwrite: true, recursive: true });

            // add tauri package
            const yarnAddTauriCmd = execa('node', [yarn, 'add', 'tauri'], { cwd: output})
            yarnAddTauriCmd.stdout?.pipe(task.stdout())
            yarnAddTauriCmd.stderr?.pipe(task.stdout())
            await yarnAddTauriCmd

            // Init tauri
            const tauriInitCmd = execa('node', [
              yarn,
              'tauri',
              'init',
              '--ci',
              '-l',
              '-A',
              'AAA',
              '-W',
              ctx.taskSettings.tauri.window.title,
              '-D',
              ctx.taskSettings.build.distDir,
              '-P',
              ctx.taskSettings.build.devPath,
              '--force',
              'template',
              '--force',
              'conf'
            ], { cwd: output })
            tauriInitCmd.stdout?.pipe(task.stdout())
            tauriInitCmd.stderr?.pipe(task.stdout())
            await tauriInitCmd

            // Merge config file
            // await fs.writeFile(path.join(tmpDir, 'src-tauri', 'tauri.conf.json'), JSON.stringify(ctx.taskSettings, null, 2))

            
            ctx.workingDirectory = tmpDir
          },
        }
      ],
    )
  }
}
