import * as path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import obfuscator from 'javascript-obfuscator';
import { createScopedLogger } from '@cyn/utils';
import { Settings } from '../models';

interface Config {
  files: string[];
}

const config: Config = {
  files: [],
};

export default {
  description: 'Minify source files',
  name: 'obfuscator',
  config,
  run: function run(
    {
      workingDirectory,
      taskSettings,
    }: {
      workingDirectory: string;
      settings: any;
      taskSettings: Config;
    },
  ): boolean {
    const logger = createScopedLogger('minify', {
      interactive: true,
    });

    const { files: patterns } = taskSettings;

    logger.info('Minifying...');

    let obfuscated = 0;

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
        const fileContent = fs.readFileSync(file, 'utf8');

        const obfuscationResult = obfuscator.obfuscate(fileContent, {
          compact: false,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.1,
          debugProtection: false,
          debugProtectionInterval: false,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: true,
          stringArray: true,
          stringArrayEncoding: 'base64',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        });

        const code = obfuscationResult.getObfuscatedCode();

        if (!code) {
          throw new Error('Empty code');
        }

        fs.writeFileSync(file, code, 'utf8');
        obfuscated += 1;
        logger.await(`Minified ${file}`);
        return true;
      } catch (e) {
        logger.error(`Failed minifying ${file}`);
        return false;
      }
      return true;
    });

    logger.success(`Successfully obfuscated ${obfuscated} files!`);

    return true;
  },
};
