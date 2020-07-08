import * as path from 'path';
import fs from 'fs-extra';
import got from 'got';
import extract from 'extract-zip';
import { exec } from 'child_process';
import signale from 'signale';
import os from 'os';
import { createScopedLogger } from '../utils/console';
import Task from '../classes/task';

interface Config {
  project: string | null
  directories: {
    name: string
    channel: string
  }[]
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

interface ItchIoLogger {
  type: string
  message: string
  progress: number
  eta: string
}

const exe = async (
  command: string,
): Promise<{ code: string; log: string[] }> => {
  const log: string[] = [];
  console.log('command', command);
  return new Promise((resolve) => {
    const npmstart = exec(command);

    if (npmstart && npmstart.stdout && npmstart.stderr) {
      npmstart.stdout.on('data', (data: Buffer) => {
        try {
          const json: ItchIoLogger = JSON.parse(data.toString()) as ItchIoLogger;

          if (json.type === 'log') {
            log.push(json.message);
          } else if (json.type === 'progress') {
            log.push(`Uploading ${Math.round(json.progress * 100)}% - ${json.eta}s`);
          }
          // logger.log(data.toString());
        } catch (e) {
          //
        }
      });

      npmstart.stderr.on('data', (data: Buffer) => {
        log.push(data.toString());
      });

      npmstart.on('exit', (code) => {
        console.log('code', code);
        resolve({
          code: (code ?? '').toString(),
          log,
        });
      });
    }
  });
};

export default {
  description: 'Publish to Itch.io',
  name: 'itch',
  config,
  run: async function run({ taskSettings, workingDirectory }) {
    const logger = createScopedLogger('itch', {
      interactive: true,
    });
    const fixed = createScopedLogger('itch');

    // const itchFolderPath = path.join(process.cwd(), 'itch');
    // const butler = path.join(itchFolderPath, `butler${os.platform() === 'win32' ? '.exe' : ''}`);

    // download butler
    // if (!fs.existsSync(itchFolderPath) || !fs.existsSync(butler)) {
    //   const platform = os.platform();
    //   const arch = os.arch();

    //   const links = [
    //     // get         remote
    //     ['darwin-x64', 'darwin-amd64'],
    //     ['linux-x64', 'linux-amd64'],
    //     ['linux-ia32', 'linux-386'],
    //     ['win32-x64', 'windows-amd64'],
    //     ['win32-ia32', 'windows-386'],
    //   ];

    //   const foundLink = links.find((link) => link[0] === `${platform}-${arch}`);
    //   if (!foundLink) {
    //     return {
    //       error: true,
    //       sources: [],
    //     };
    //   }
    //   const butlerPlatform = foundLink[1];
    //   const linkToDownload = `https://broth.itch.ovh/butler/${butlerPlatform}/LATEST/archive/default`;

    //   await fs.ensureDir(itchFolderPath);

    //   const sourceZip =
    // await downloadFile(linkToDownload, path.join(itchFolderPath, 'itch.zip'));
    //   await extractZip(sourceZip, itchFolderPath);

    //   await fs.remove(sourceZip);
    // }

    // await fs.chmod(butler, '755');

    // await exe(`${butler} upgrade -j`, logger);
    // await exe(`${butler} login`, logger);
    const butler = 'butler';

    const result = await exe(`${butler} -V`);
    console.log('result', result);
    if (result[0] !== 'v') {
      logger.error('Butler not found');
    }

    // console.log('workingDirectory', workingDirectory);

    const { project, directories } = taskSettings as Config;
    if (!project) {
      logger.error('You must specify a project in the itch configuration!');
      return {
        error: true,
        sources: [],
      };
    }

    // console.log('directories', directories);

    let uploaded = false;
    for (let i = 0; i < directories.length; i += 1) {
      const directory = directories[i];

      const outDir = path.resolve(process.cwd(), directory.name);

      if (outDir === workingDirectory) {
        logger.log('Publishing to itch...');
        // await exe(`${butler} push ${outDir} ${project}:${directory.channel} -j`, logger);
        logger.success(`${directory.channel} uploaded successfully`);
        uploaded = true;
      }
    }

    if (!uploaded) {
      logger.warn(`No match found in configuration for "${workingDirectory}". Skipping.`);
    }

    return {
      sources: [workingDirectory],
    };
  },
} as Task;
