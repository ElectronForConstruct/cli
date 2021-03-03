import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { createScopedLogger, Ctx, Task, TaskManagerFactory, yarn } from '@cyn/utils';
import execa from 'execa'

const logger = createScopedLogger('tauri/setup', {
  interactive: false,
});

export default class TauriSetup extends Task {
  description = 'Setup the directory'
  id = 'tauri/setup'
  config = {}

  private tasks = TaskManagerFactory<Ctx>()

  async run(mainCtx: Ctx, task) {
    this.tasks.ctx = mainCtx

    this.tasks.add(
      [
        {
          title: 'Tauri setup',
          task: async (ctx: Ctx, task): Promise<void> => {
            const tmpDir = path.join(os.tmpdir(), `cyn_tauri_${path.basename(process.cwd())}`);

            // copy input folder to temp
            const output = path.join(tmpDir)
            const input = path.join(process.cwd(), ctx.workingDirectory)
            task.output = 'output' + output
            task.output = 'input' + input
            await fs.copy(input, output, { overwrite: true, recursive: true });

            process.chdir(tmpDir);

            // Ensure folder is ready for tauri
            await fs.ensureDir(path.join(tmpDir, 'src-tauri'));

            // Create config file
            await fs.writeFile(path.join(tmpDir, 'src-tauri', 'tauri.conf.json'), JSON.stringify(ctx.taskSettings, null, 2))

            // add tauri package
            const yarnAddTauriCmd = execa('node', [yarn, 'add', 'tauri', '--cwd=' + output])
            yarnAddTauriCmd.stdout?.pipe(task.stdout())
            await yarnAddTauriCmd

            // Init tauri
            const tauriDepsInstallCmd = execa('node', [yarn, 'tauri', 'deps', 'install', '--directory=' + output])
            tauriDepsInstallCmd.stdout?.pipe(task.stdout())
            await tauriDepsInstallCmd

            // const info = require('tauri/dist/api/info');

            // const infos = await info();
            // logger.info('infos', infos);

            ctx.workingDirectory = tmpDir
            mainCtx.workingDirectory = tmpDir
          },
        }
      ],
      { exitOnError: true, concurrent: false, ctx: mainCtx }
    )

    return this.tasks.runAll()
  }
}
