import * as path from 'path';
import packager, { Options as BuildSettings } from 'electron-packager';
import * as fs from 'fs';
import prettyDisplayFolders from '../utils/prettyFolder';

import setupDir from '../utils/setupDir';
import SettingsManager from '../classes/settingsManager';
import { createScopedLogger } from '../utils/console';
import { dispatchHook } from '../classes/hooksManager';

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

export default async function build(options: any): Promise<boolean> {
  // const logger = this.createLogger();

  const sm = SettingsManager.getInstance();

  // ---- TODO this is shared with preview ^^^

  const logger = createScopedLogger('build');

  const { settings } = sm;

  logger.info('Build started...');

  const buildSettings: BuildSettings = { ...defaultConfig, ...settings.build };

  if (settings.electron) {
    buildSettings.electronVersion = settings.electron;
  }

  // resolve out directory
  if (buildSettings.out && !path.isAbsolute(buildSettings.out)) {
    buildSettings.out = path.join(process.cwd(), buildSettings.out);
  }

  // setup directories
  const tempDir = await setupDir('build');

  // set src dir to tmpdir
  buildSettings.dir = tempDir;

  dispatchHook('pre-build', tempDir);

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

  // buildSettings.quiet = true;
  // @ts-ignore
  buildSettings.author = 'Me';

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

    dispatchHook('post-build', folders);
  }
  return true;
}
