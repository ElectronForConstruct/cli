import * as path from 'path';
import eb, { Configuration } from 'electron-builder/out';
import { createScopedLogger } from '../utils/console';
import Hook from '../classes/hook';

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
      workingDirectory,
      hookSettings,
    },
  ) {
    const logger = createScopedLogger('installer', {
      interactive: true,
    });

    // todo https://www.electron.build/#pack-only-in-a-distributable-format

    if (settings.electron) {
      hookSettings.electronVersion = settings.electron;
    }

    if (!hookSettings.directories) {
      hookSettings.directories = {};
    }

    hookSettings.directories.app = workingDirectory;

    if (!path.isAbsolute(hookSettings.directories.output ?? '')) {
      hookSettings.directories.output = path.join(process.cwd(), hookSettings.directories.output ?? '');
    }
    if (!path.isAbsolute(hookSettings.directories.app)) {
      hookSettings.directories.app = path.join(process.cwd(), hookSettings.directories.app);
    }
    if (!path.isAbsolute(hookSettings.directories.buildResources ?? '')) {
      hookSettings.directories.buildResources = path.join(
        process.cwd(),
        hookSettings.directories.buildResources ?? '',
      );
    }

    try {
      // @ts-ignore
      const appPaths = await eb.build({ config: hookSettings });
      console.log('appPaths', appPaths);
    } catch (e) {
      logger.log('There was an error building your project:', e);
    }

    return {
      sources: [workingDirectory],
    };
  },
} as Hook;
