import * as path from 'path';
import eb, { Configuration } from 'electron-builder/out';
import Task from '../classes/Task';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

const config: DeepWriteable<Configuration> = {
  appId: 'com.you.yourapp',

  asar: false,

  productName: 'YourAppName',
  copyright: `Copyright © ${new Date().getFullYear()} You`,
  directories: {
    buildResources: 'build',
    output: 'installers',
  },
  files: [
    '!preview.exe',
    '!preview',
    '!node_modules/greenworks/!**',
    '!node_modules/app-builder-bin/!**',
    '!node_modules/app-builder-lib/!**',
  ],
  publish: undefined,
};

export default {
  description: 'Generate installer',
  name: 'installer',
  config,
  run: async function run(
    {
      settings,
      workingDirectory,
      taskSettings,
    },
  ) {
    let { electronVersion, directories } = taskSettings as DeepWriteable<Configuration>;
    const { electron } = settings as any;

    // todo https://www.electron.build/#pack-only-in-a-distributable-format

    if (electron) {
      electronVersion = electron;
    }

    if (!directories) {
      directories = {};
    }

    directories.app = workingDirectory;

    if (!path.isAbsolute(directories.output ?? '')) {
      directories.output = path.join(process.cwd(), directories.output ?? '');
    }
    if (!path.isAbsolute(directories.app)) {
      directories.app = path.join(process.cwd(), directories.app);
    }
    if (!path.isAbsolute(directories.buildResources ?? '')) {
      directories.buildResources = path.join(
        process.cwd(),
        directories.buildResources ?? '',
      );
    }

    try {
      // @ts-ignore
      const appPaths = await eb.build({ config: taskSettings });
    } catch (e) {
      // logger.log('There was an error building your project:', e);
    }

    return {
      source: workingDirectory,
    };
  },
} as Task;
