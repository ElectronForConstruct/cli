import packager, { Options as BuildSettings } from 'electron-packager';
import path from 'path';
import fs from 'fs-extra';
import prettyDisplayFolders from './utils/prettyFolder';
import { PackageJson } from 'type-fest'
import { Module } from '@cyn/utils';

const config: BuildSettings = {
  // electronVersion: '8.0.0',
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
  tmpdir: path.join(process.cwd(), '.cyn', 'tmp')
}

interface Output {
  source: string[]
}

export default class extends Module<BuildSettings, Output> {
  description = 'Package your app'
  inputs = config

  async run(ctx: BuildSettings) {
    const buildSettings = ctx;

    const pkgPath = path.join(this.cwd, 'package.json');
    const pkgRawContent = await fs.readFile(pkgPath, 'utf8');
    const pkgJson = JSON.parse(pkgRawContent) as PackageJson;

    if (!buildSettings.electronVersion) {
      buildSettings.electronVersion = pkgJson.devDependencies?.electron;
    }

    // resolve out directory
    if (buildSettings.out && !path.isAbsolute(buildSettings.out)) {
      buildSettings.out = path.join(process.cwd(), buildSettings.out);
    }

    // set src dir to tmpdir
    buildSettings.dir = this.cwd;

    if (!buildSettings.appVersion && pkgJson.version) {
      buildSettings.appVersion = pkgJson.version;
    }

    if (!buildSettings.name && pkgJson.name) {
      buildSettings.name = pkgJson.name;
    }

    if (
      buildSettings.win32metadata && buildSettings.win32metadata.CompanyName && pkgJson.author
    ) {
      buildSettings.win32metadata.CompanyName = pkgJson.author.toString();
    }

    // buildSettings.quiet = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    buildSettings.author = pkgJson.author;

    // Package for real
    try {
      // logger.start('Packaging started');

      // const log: string[] = [];
      // const unhook = hookStdout((string: string) => {
      //   log.push(string);
      // });

      const result = await packager(buildSettings);

      const isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

      if (buildSettings.out) {
        const { out } = buildSettings;
        const folders = fs
          .readdirSync(out)
          .map((name: string) => path.join(out ?? '', name))
          .filter(isDirectory);

        // logger.success('Files packed successfully!');

        if (Array.isArray(folders)) {
          prettyDisplayFolders(folders);
        } else {
          prettyDisplayFolders([folders]);
        }

        return {
          source: folders,
        };
      }
    } catch (e) {
      // logger.error('An error occurred while packaging your apps');
      // logger.error(e);
      return {
        source: []
      }
    }

    return {
      source: []
    }
  }
}
