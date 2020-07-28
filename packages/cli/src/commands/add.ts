import download from 'download-tarball';
import got from 'got';
import path from 'path';
import { Args } from '../models';

export default {
  callback: async (plugin: string, args: Args): Promise<void> => {
    console.log('add', plugin);

    const matches = /^(.+?)(?:@(.*?))?$/.exec(plugin);
    console.log('matches', matches);

    // @ts-ignore
    const [, packageName, packageVersion] = matches;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const response:any = await got(`https://registry.npmjs.org/${packageName}`).json();
    // console.log('response', response);
    const version = packageVersion || response['dist-tags'].latest;
    console.log('version', version);
    // const [full, scope, packageName] = /^(?:@([^/]+?)[/])?([^/]+?)$/.exec(plugin);

    const URL: string = response.versions[version].dist.tarball;

    const destPath = path.join(process.cwd(), '.cyn', 'plugins', packageName, version);
    console.log('destPath', destPath);

    await download({
      url: URL,
      dir: destPath,
    });
  },
  name: 'add <plugin>',
  description: 'Add a local plugin to your project',
};
