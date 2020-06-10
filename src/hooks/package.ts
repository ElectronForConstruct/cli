import packager, { Options as BuildSettings } from 'electron-packager';
import * as path from 'path';
import fs from 'fs-extra';
import prettyDisplayFolders from '../utils/prettyFolder';
import { createScopedLogger } from '../utils/console';

const defaultConfig: BuildSettings = {
  electronVersion: '8.0.0',
  dir: process.cwd(),
  asar: true,
  // icon: path.join(process.cwd(), 'build', 'icon'),
  out: 'dist',
  overwrite: true,
  extraResource: [],
  ignore: [
    /preview*/,
    /node_modules\/greenworks/,
    /node_modules\/app-builder-bin/,
    /node_modules\/app-builder-lib/,
  ],
  win32metadata: {},
};

export default {
  description: 'Package your app',
  name: 'package_electron',
  run: async function run(
    {
      workingDirectory,
      settings,
      hookSettings,
    }: {
      workingDirectory: string;
      settings: any;
      hookSettings: BuildSettings;
    },
  ): Promise<boolean> {
    const logger = createScopedLogger('package');

    const buildSettings: BuildSettings = { ...defaultConfig, ...hookSettings };

    if (settings.electron) {
      buildSettings.electronVersion = settings.electron;
    }

    // resolve out directory
    if (buildSettings.out && !path.isAbsolute(buildSettings.out)) {
      buildSettings.out = path.join(process.cwd(), buildSettings.out);
    }

    // set src dir to tmpdir
    buildSettings.dir = workingDirectory;

    if (
      !buildSettings.appVersion
      && (settings && settings.project && settings.project.version)
    ) {
      buildSettings.appVersion = settings.project.version;
    }

    if (!buildSettings.name && (settings && settings.project && settings.project.name)) {
      buildSettings.name = settings.project.name;
    }

    if (
      buildSettings.win32metadata && buildSettings.win32metadata.CompanyName
      && settings.project && settings.project.author
    ) {
      buildSettings.win32metadata.CompanyName = settings.project?.author;
    }

    // buildSettings.quiet = true;
    // @ts-ignore
    buildSettings.author = 'Me';


    // Package for real
    try {
      logger.start('Packaging started');
      const appPaths = await packager(buildSettings);

      logger.success('Files packed successfully!');
      if (Array.isArray(appPaths)) {
        prettyDisplayFolders(appPaths);
      } else {
        prettyDisplayFolders([appPaths]);
      }

      const isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

      if (buildSettings.out) {
        const { out } = buildSettings;
        const folders = fs
          .readdirSync(out)
          .map((name: string) => path.join(out ?? '', name))
          .filter(isDirectory);
      }
    } catch (e) {
      logger.error('An error occured while packaging your apps');
      logger.error(e);
    }

    return true;
  },
};
