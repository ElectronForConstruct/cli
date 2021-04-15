import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { Module, yarn } from '@cyn/utils';
import execa from 'execa'

interface SetupCtx {
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

export default {
  description: 'Setup the directory',
  id: 'tauri/setup',
  input: {},
  output: {},

  async run(ctx) {
      const tmpDir = path.join(os.tmpdir(), `cyn_tauri_${path.basename(process.cwd())}`);

      // copy input folder to temp
      const output = path.join(tmpDir)
      const input = path.join(process.cwd(), ctx.workingDirectory)
      await fs.copy(input, output, { overwrite: true, recursive: true });

      // add tauri package
      const yarnAddTauriCmd = execa('node', [yarn, 'add', 'tauri'], { cwd: output})
      yarnAddTauriCmd.stdout?.pipe(process.stdout)
      yarnAddTauriCmd.stderr?.pipe(process.stderr)
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
      tauriInitCmd.stdout?.pipe(process.stdout)
      tauriInitCmd.stderr?.pipe(process.stderr)
      await tauriInitCmd

      // Merge config file
      // await fs.writeFile(path.join(tmpDir, 'src-tauri', 'tauri.conf.json'), JSON.stringify(ctx.taskSettings, null, 2))

      ctx.workingDirectory = tmpDir
    }
} as Module<SetupCtx>
