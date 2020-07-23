import * as path from 'path';
import * as os from 'os';
import fs from 'fs-extra';

import installPkg from './installPackages';
import { SetupConfig } from '../models';

const isURL = (str: string): boolean => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(str);

async function setupDir(
  mode: 'preview' | 'build',
  taskSettings: SetupConfig,
): Promise<string> {
  // create temporary directory
  const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);

  if (taskSettings.clearCache) {
    await fs.remove(tmpDir);
  }
  await fs.ensureDir(tmpDir);

  console.log('tmpDir', tmpDir);

  // Prepare template
  await fs.copy(path.join(__dirname, '..', '..', 'templates', 'runtime'), tmpDir);

  // Fill package.json
  const pkgJSONPath = path.join(tmpDir, 'package.json');
  const pkgJSONData = await fs.readFile(pkgJSONPath, 'utf8');
  const pkgJSON = JSON.parse(pkgJSONData) as { author: string | undefined };

  pkgJSON.author = taskSettings.project.author;

  await fs.writeFile(pkgJSONPath, JSON.stringify(pkgJSON), 'utf8');

  // Generate configuration
  await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(taskSettings)}`, 'utf8');

  // Install dependencies
  await installPkg([`electron@${taskSettings.version}`], tmpDir, true);

  return tmpDir;
}

export default setupDir;
