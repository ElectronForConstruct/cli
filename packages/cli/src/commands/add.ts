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

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const npmURL = `https://registry.npmjs.org/${packageName}`;
    console.log('fetching', npmURL);
    const response:any = await got(npmURL).json();
    const version = packageVersion || response['dist-tags'].latest;

    const URL: string = response.versions[version].dist.tarball;

    const destPath = path.join(process.cwd(), '.cyn', 'plugins', packageName);

    const directoryExists = await fs.pathExists(destPath);
    if (!directoryExists) {
      await download({
        url: URL,
        dir: destPath,
      });
    }
  },
  name: 'add <plugin>',
  description: 'Add a local plugin to your project',
};
