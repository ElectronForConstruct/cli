import SetupConfig from './utils/models';
import installPkg from './utils/installPackages'
import fs from 'fs-extra'
import path from 'path'
import { Module } from '@cyn/utils'

const config: SetupConfig = {
  version: '10.1.2',
  clearCache: true,
  project: {
    author: 'Me',
  },
};

type Settings = typeof config

export default {
  description: 'Wrap an app with Electron',
  input: {},
  output: {},
  async run(ctx) {
    const settings = ctx.taskSettings;

    // create temporary directory
    const tmpDir = path.join(process.cwd(), 'tmp', `cyn_${path.basename(process.cwd())}`);

    // const tmpDir = path.join(os.tmpdir(), `cyn_${path.basename(process.cwd())}`);
    if (settings.clearCache) {
      await fs.remove(tmpDir);
    }
    await fs.ensureDir(tmpDir);

    // Prepare template
    await fs.copy(path.join(__dirname, '..', 'templates', 'runtime'), tmpDir);
    // Fill package.json
    const pkgJSONPath = path.join(tmpDir, 'package.json');
    const pkgJSONData = await fs.readFile(pkgJSONPath, 'utf8');
    const pkgJSON = JSON.parse(pkgJSONData) as { author: string | undefined };
    pkgJSON.author = settings.project.author;
    await fs.writeFile(pkgJSONPath, JSON.stringify(pkgJSON), 'utf8');

    // Generate configuration
    await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(ctx.taskSettings)}`, 'utf8');

    // Install dependencies
    const install = installPkg([`electron@${settings.version}`], tmpDir, true);
    install.stdout?.pipe(process.stdout)
    install.stderr?.pipe(process.stderr)
    await install

    // Copy content
    const appPath = path.join(tmpDir, 'app')
    await fs.ensureDir(appPath);
    await fs.copy(ctx.workingDirectory, appPath);

    ctx.workingDirectory = tmpDir
  }
} as Module<Settings>