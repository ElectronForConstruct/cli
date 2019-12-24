import * as path from 'path';
import packager from 'electron-packager';
import * as fs from 'fs';
import prettyDisplayFolders from '../utils/prettyFolder';
import { postBuild, preBuild } from '../utils/hooks';
import { CynModule } from '../definitions';
import setupDir from '../utils/setupDir';

const command: CynModule = {
  name: 'build',
  cli: [
    {
      name: 'zip',
      shortcut: 'z',
      description: 'A zip file to use instead of the "app" folder',
    },
  ],
  description: 'Package your app for any OS',
  config: {
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
  },
  async run(args, settings) {
    this.logger.info('Build started...');

    if (!settings.build) {
      this.logger.error('It looks like your "build" configuration is empty');
      return false;
    }

    const packOptions = settings.build;
    if (settings.electron) {
      packOptions.electronVersion = settings.electron;
    }

    // resolve out directory and delete it
    if (packOptions.out && !path.isAbsolute(packOptions.out)) {
      packOptions.out = path.join(process.cwd(), packOptions.out);
    }

    // setup directories
    const zipFile = args.zip ? args.zip : null;
    const tempDir = await setupDir(settings, zipFile, 'build');

    // set src dir to tmpdir
    packOptions.dir = tempDir;

    if (this.modules && this.modules.length > 0) {
      await preBuild(this.modules, args, settings, tempDir);
    }

    // Compute datas //////////////

    if (
      !packOptions.appVersion
      && (settings && settings.project && settings.project.version)
    ) {
      packOptions.appVersion = settings.project.version;
    }

    if (!packOptions.name && (settings && settings.project && settings.project.name)) {
      packOptions.name = settings.project.name;
    }

    if (
      packOptions.win32metadata && packOptions.win32metadata.CompanyName
      && settings.project && settings.project.author
    ) {
      packOptions.win32metadata.CompanyName = settings.project?.author;
    }

    packOptions.quiet = true;

    // ////////////////////////////

    try {
      this.logger.start('Packaging started');
      const appPaths = await packager(packOptions);

      this.logger.success('Files packed successfuly!');
      if (Array.isArray(appPaths)) {
        prettyDisplayFolders(appPaths);
      } else {
        prettyDisplayFolders([appPaths]);
      }
    } catch (e) {
      this.logger.error('An error occured while packaging your apps');
      this.logger.error(e);
    }

    const isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

    if (packOptions.out !== undefined) {
      const folders = fs
        .readdirSync(packOptions.out)
        .map((name) => path.join(packOptions.out || '', name))
        .filter(isDirectory);

      if (this.modules && this.modules.length > 0) {
        await postBuild(this.modules, args, settings, folders);
      }
    }
    return true;
  },
};

export default command;
