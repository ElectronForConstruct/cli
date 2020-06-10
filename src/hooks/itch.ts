import * as path from 'path';
import fs from 'fs-extra';
import got from 'got';
import extract from 'extract-zip';
import { exec } from 'child_process';
import signale from 'signale';
import os from 'os';
import { Settings } from '../models';
import { createScopedLogger } from '../utils/console';


interface Config {
  project: string | null;
  directories: {
    name: string;
    channel: string;
  }[];
}

const config: Config = {
  project: null,
  directories: [],
};

const downloadFile = async (url: string, p: string): Promise<string> => new Promise((resolve) => {
  got.stream(url)
    .pipe(fs.createWriteStream(
      p,
    ))
    .on('finish', () => {
      resolve(p);
    });
});

const extractZip = async (from: string, to: string): Promise<string> => {
  await extract(from, { dir: to });
  return to;
};

const exe = async (
  command: string,
  logger: signale.Signale<signale.DefaultMethods>,
): Promise<string> => {
  logger.log('Publishing to itch...');
  return new Promise((resolve) => {
    const npmstart = exec(command);

    if (npmstart && npmstart.stdout && npmstart.stderr) {
      npmstart.stdout.on('data', (data) => {
        try {
          const json = JSON.parse(data.toString());

          if (json.type === 'log') {
            logger.log(json.message);
          } else if (json.type === 'progress') {
            logger.log(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
          }
          // logger.log(data.toString());
        } catch (e) {
          //
        }
      });

      npmstart.stderr.on('data', (data) => {
        logger.error(data.toString());
      });

      npmstart.on('exit', (code) => {
        resolve((code ?? '').toString());
      });
    }
  });
};

export default {
  description: 'Publish to Itch.io',
  name: 'itch',
  config,
  run: async function run(
    {
      hookSettings,
    }: {
      workingDirectory: string;
      settings: any;
      hookSettings: Config;
    },
  ): Promise<boolean> {
    const logger = createScopedLogger('itch', {
      interactive: true,
    });

    const itchFolderPath = path.join(process.cwd(), 'itch');
    const butler = path.join(itchFolderPath, `butler${os.platform() === 'win32' ? '.exe' : ''}`);

    // download butler
    if (!fs.existsSync(itchFolderPath) || !fs.existsSync(butler)) {
      const platform = os.platform();
      const arch = os.arch();

      const links = [
      // get         remote
        ['darwin-x64', 'darwin-amd64'],
        ['linux-x64', 'linux-amd64'],
        ['linux-ia32', 'linux-386'],
        ['win32-x64', 'windows-amd64'],
        ['win32-ia32', 'windows-386'],
      ];

      const foundLink = links.find((link) => link[0] === `${platform}-${arch}`);
      if (!foundLink) {
        return false;
      }
      const butlerPlatform = foundLink[1];
      const linkToDownload = `https://broth.itch.ovh/butler/${butlerPlatform}/LATEST/archive/default`;

      await fs.ensureDir(itchFolderPath);

      const sourceZip = await downloadFile(linkToDownload, path.join(itchFolderPath, 'itch.zip'));
      await extractZip(sourceZip, itchFolderPath);

      await fs.remove(sourceZip);
    }

    await fs.chmod(butler, '755');

    await exe(`${butler} upgrade -j`, logger);
    await exe(`${butler} login`, logger);

    const { project, directories } = hookSettings;
    if (!project) {
      logger.error('You must specify a project in the itch configuration!');
      return false;
    }

    for (let i = 0; i < directories.length; i += 1) {
      const directory = directories[i];

      let outDir = directory.name;
      if (!path.isAbsolute(outDir)) {
        outDir = path.join(process.cwd(), outDir);
      }

      await exe(`${butler} push ${outDir} ${project}:${directory.channel} -j`, logger);
    }

    logger.success('Directories uploaded successfully');

    return true;
  },
};
