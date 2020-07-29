import download from 'download-tarball';
import got from 'got';
import path from 'path';
import fs from 'fs-extra';
import { Args } from '../models';

export default {
  callback: async (plugin: string, args: Args): Promise<void> => {
    const matches = /^(.+?)(?:@(.*?))?$/.exec(plugin);

    // @ts-ignore
    const [, packageName, packageVersion] = matches;

    const pluginPath = path.join(process.cwd(), '.cyn', 'plugins');
    const destPath = path.join(pluginPath, packageName);

    const directoryExists = await fs.pathExists(destPath);
    if (directoryExists) {
      await fs.remove(destPath);
      console.log('Plugin remove with success');
    } else {
      console.log(`No installed module "${packageName}" found`);
    }
  },
  name: 'remove <plugin>',
  description: 'Remove a local plugin from your project',
};
