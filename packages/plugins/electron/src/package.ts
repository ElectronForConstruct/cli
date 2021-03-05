import packager, { Options as BuildSettings } from 'electron-packager';
import path from 'path';
import fs from 'fs-extra';
import { createScopedLogger } from '@cyn/utils';
import prettyDisplayFolders from './utils/prettyFolder';

interface PkgJSON {
  devDependencies: Record<string, string>
  version: string
  name: string
  author: string
}


// function hookStdout(callback) {
//   const boundProcessStdout = process.stdout.write.bind(process.stdout);
//   const boundProcessStderr = process.stderr.write.bind(process.stderr);

//   process.stdout.write = (string, encoding, fd) => {
//     // boundProcessStdout(string, encoding, fd);
//     callback(string, encoding, fd, false);
//   };

//   process.stderr.write = (string, encoding, fd) => {
//     // boundProcessStderr(string, encoding, fd);
//     callback(string, encoding, fd, true);
//   };

//   return () => {
//     process.stdout.write = boundProcessStdout;
//     process.stderr.write = boundProcessStderr;
//   };
// }

export default {
  description: 'Package your app',
  name: 'electron/package',
  config: {
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
  },
  run: async function run({ workingDirectory, taskSettings }: any) {
    const logger = createScopedLogger('package');

    const buildSettings: BuildSettings = taskSettings as BuildSettings;

    const pkgPath = path.join(workingDirectory, 'package.json');
    const pkgRawContent = await fs.readFile(pkgPath, 'utf8');
    const pkgJson = JSON.parse(pkgRawContent) as PkgJSON;

    if (!buildSettings.electronVersion) {
      buildSettings.electronVersion = pkgJson.devDependencies.electron;
    }

    // resolve out directory
    if (buildSettings.out && !path.isAbsolute(buildSettings.out)) {
      buildSettings.out = path.join(process.cwd(), buildSettings.out);
    }

    // set src dir to tmpdir
    buildSettings.dir = workingDirectory;

    if (!buildSettings.appVersion && pkgJson.version) {
      buildSettings.appVersion = pkgJson.version;
    }

    if (!buildSettings.name && pkgJson.name) {
      buildSettings.name = pkgJson.name;
    }

    if (
      buildSettings.win32metadata && buildSettings.win32metadata.CompanyName && pkgJson.author
    ) {
      buildSettings.win32metadata.CompanyName = pkgJson.author;
    }

    buildSettings.quiet = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    buildSettings.author = pkgJson.author;

    // Package for real
    try {
      logger.start('Packaging started');

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

        logger.success('Files packed successfully!');

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
      logger.error('An error occurred while packaging your apps');
      logger.error(e);
    }

    return {
      source: workingDirectory,
    };
  },
}
