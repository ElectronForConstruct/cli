import { createScopedLogger } from '@cyn/utils';
import download from 'download-tarball';
import got from 'got';
import path from 'path';
import slash from 'slash';
import fs from 'fs-extra';

interface PackageJSON {
  name: string;
  version: string;
  main: string;
}

const isPathRegex = /(\\\\?([^\\/]*[\\/])*)([^\\/]+)$/;

const logger = createScopedLogger('system', {
  interactive: false,
});

const getCurrentVersion = async (packageName: string, overrideVersion: string): Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const npmURL = `https://registry.npmjs.org/${packageName}`;
  logger.await(`Fetching ${npmURL}`);
  const response:any = await got(npmURL).json();
  return response.versions[overrideVersion ?? response['dist-tags'].latest];
};

const add = async (plugin: string): Promise<any> => {
  const isPath = isPathRegex.test(plugin);

  let packageBasePath;
  let packageJSONPath;

  if (isPath) {
    packageBasePath = (slash(plugin));
    packageJSONPath = path.join(packageBasePath, 'package.json');
  } else {
    const matches = /^(.+?)(?:@(.*?))?$/.exec(plugin);

    // @ts-ignore
    const [, name, packageVersion] = matches;

    const pkgName = name as string;

    logger.info(`Detected plugin "${plugin}"`);

    const destPath = path.join(process.cwd(), '.cyn', 'plugins', pkgName);

    const versionInfos = await getCurrentVersion(pkgName, packageVersion);

    let mustDownload = false;

    packageBasePath = path.join(destPath, 'package');
    packageJSONPath = path.join(packageBasePath, 'package.json');

    const directoryExists = await fs.pathExists(destPath);
    // If directory does not exist, must download it
    if (!directoryExists) {
      mustDownload = true;
    } else {
    // Otherwise, read the package.JSON to check if
    // pkg version match fetched version

      const packageJSONRaw = await fs.readFile(packageJSONPath, 'utf8');
      const packageJSON = JSON.parse(packageJSONRaw);

      if (!versionInfos) {
        throw new Error('Version does not exist!');
      }

      console.log('versionInfos', versionInfos);

      if (packageJSON.version !== versionInfos.version) {
        mustDownload = true;
      } else {
        logger.success('Versions matched');
      }
    }

    if (mustDownload) {
      const URL: string = versionInfos.dist.tarball;
      logger.await('Downloading plugin');
      await download({
        url: URL,
        dir: destPath,
      });
      logger.success('Plugin Downloaded');
    }
  }

  if (!fs.existsSync(packageJSONPath)) {
    throw new Error(`Plugin "${plugin}" not found`);
  }

  const packageJSONRaw = await fs.readFile(packageJSONPath, 'utf8');
  const packageJSON: PackageJSON = JSON.parse(packageJSONRaw);

  const paths = [
    path.join(packageBasePath, packageJSON.main),
    path.join(packageBasePath, 'index.js'),
    path.join(packageBasePath, 'dist', 'index.js'),
    // read package.json 'main'
  ];

  for (let index = 0; index < paths.length; index += 1) {
    const testPath = paths[index];

    const exists = await fs.pathExists(testPath);
    if (exists) {
      const importedPlugin = await import(testPath);
      logger.success(`Plugin "${packageJSON.name}" imported`);
      return importedPlugin;
    }
  }

  throw new Error(`Unable to find plugin "${plugin}".`);
};

export default add;
