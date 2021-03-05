import SetupConfig from './utils/models';
import installPkg from './utils/installPackages'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

const getMethods = (obj: any) => {
  const properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  // @ts-ignore
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}

const config: SetupConfig = {
  version: '10.1.2',
  clearCache: true,
  project: {
    author: 'Me',
  },
};

export default {
  description: 'Setup the directory',
  name: 'electron/setup',
  config,
  run: async function run({ taskSettings }: any) {

    const settings = taskSettings as SetupConfig;
    // create temporary directory
    const tmpDir = path.join(process.cwd(), 'tmp', `efc_${path.basename(process.cwd())}`);
    // const tmpDir = path.join(os.tmpdir(), `efc_${path.basename(process.cwd())}`);

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
    await fs.writeFile(path.join(tmpDir, 'config.js'), `module.exports=${JSON.stringify(taskSettings)}`, 'utf8');

    // Install dependencies
    await installPkg([
      ['electron', settings.version]
    ], tmpDir, true);

    return {
      source: tmpDir,
    };
  }
}
