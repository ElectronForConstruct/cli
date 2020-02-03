import * as path from 'path';
import packager from 'electron-packager';
import * as fs from 'fs';
import mri from 'mri';
import prettyDisplayFolders from '../utils/prettyFolder';
import { Settings } from '../models';
import setupDir from '../utils/setupDir';
import CynModule from '../classes/cynModule';

export default class extends CynModule {
  name = 'build';

  cli = [
  ];

  description = 'Package your app for any OS';

  config = {
    dir: process.cwd(),
    asar: true,
    icon: path.join(process.cwd(), 'build', 'icon'),
    out: 'dist',
    overwrite: true,
    extraResource: [],
    ignore: [
      'preview*',
      'node_modules/greenworks',
      'node_modules/app-builder-bin',
      'node_modules/app-builder-lib',
    ],
    win32metadata: {},
  };

  run = async (args: mri.Argv, settings: Settings): Promise<boolean> => {
    const logger = this.createLogger();

    logger.info('Build started...');

    let buildSettings = settings.build;

    if (!buildSettings) {
      buildSettings = {
        dir: '',
      };
    }

    if (settings.electron) {
      buildSettings.electronVersion = settings.electron;
    }

    // resolve out directory and delete it
    if (buildSettings.out && !path.isAbsolute(buildSettings.out)) {
      buildSettings.out = path.join(process.cwd(), buildSettings.out);
    }

    // setup directories
    // const zipFile = args.zip ? args.zip : null;
    const tempDir = await setupDir(settings, 'build');

    // set src dir to tmpdir
    buildSettings.dir = tempDir;

    this.dispatchHook('pre-build', tempDir);

    // Compute datas //////////////

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

    buildSettings.quiet = true;

    // ////////////////////////////

    try {
      logger.start('Packaging started');
      const appPaths = await packager(buildSettings);

      logger.success('Files packed successfuly!');
      if (Array.isArray(appPaths)) {
        prettyDisplayFolders(appPaths);
      } else {
        prettyDisplayFolders([appPaths]);
      }
    } catch (e) {
      logger.error('An error occured while packaging your apps');
      logger.error(e);
    }

    const isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

    if (buildSettings.out) {
      const { out } = buildSettings;
      const folders = fs
        .readdirSync(out)
        .map((name) => path.join(out ?? '', name))
        .filter(isDirectory);

      this.dispatchHook('post-build', folders);
    }
    return true;
  };
}
