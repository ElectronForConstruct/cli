import * as path from 'path';
import * as os from 'os';
import fs from 'fs-extra';

import SettingsManager from '../classes/settingsManager';

import installPkg from './installPackages';
import { SetupDirOptions } from '../models';

const isURL = (str: string): boolean => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(str);

async function setupDir(
  mode: 'preview' | 'build',
  options: SetupDirOptions = {},
): Promise<string> {
  const sm = SettingsManager.getInstance();
  const { settings } = sm;
  const { electron } = settings;


  // create temporary directory
  const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);

  if (options.clearCache) {
    await fs.remove(tmpDir);
  }
  await fs.ensureDir(tmpDir);

  // Prepare template
  await fs.copy(path.join(__dirname, '..', '..', 'templates', 'runtime'), tmpDir);

  // Generate configuration
  await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(settings)}`, 'utf8');

  // Install dependencies
  if (mode === 'build') {
    await installPkg([], tmpDir);
  } else if (electron) {
    await installPkg([`electron@${electron}`], tmpDir, true);
  } else {
    await installPkg(['electron'], tmpDir, true);
  }

  return tmpDir;
}

export default setupDir;
