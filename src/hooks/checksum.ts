import * as path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import crypto from 'crypto';
import { createScopedLogger } from '../utils/console';

interface Config {
  filename: string,
  files: string[]
}

const config: Config = {
  filename: 'checksum',
  files: [],
};

const generateChecksum = (
  str: string,
  algorithm = 'md5',
  encoding: crypto.HexBase64Latin1Encoding = 'hex',
): string => crypto
  .createHash(algorithm)
  .update(str, 'utf8')
  .digest(encoding);

export default {
  description: 'Check if files are not changed before running your game',
  name: 'checksum',
  config,
  run: function run(
    {
      workingDirectory,
      hookSettings,
    }: {
      workingDirectory: string
      settings: any
      hookSettings: Config
    },
  ): boolean {
    const logger = createScopedLogger('minify', {
      interactive: true,
    });

    const { files: patterns, filename } = hookSettings;

    logger.info('Minifying...');

    const obfuscated = 0;
    const checksums: { file: string; checksum: string; }[] = [];

    const files: string[] = [];
    patterns.forEach((pattern) => {
      const matchedFiles = glob.sync(pattern, {
        cwd: workingDirectory,
        nodir: true,
      });
      files.push(...matchedFiles.map((file) => path.resolve(workingDirectory, file)));
    });

    files.forEach((file: string) => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const checksum = generateChecksum(content);
        checksums.push({ file, checksum });
      } catch (e) {
        logger.error(`Failed minifying ${file}`);
        return false;
      }
      return true;
    });

    fs.writeFileSync(path.join(workingDirectory, filename), JSON.stringify(checksums, null, '  '), 'utf8');

    logger.success(`Successfully obfuscated ${obfuscated} files!`);

    return true;
  },
};
