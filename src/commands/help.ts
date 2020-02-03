import logger from 'signale';
import mri from 'mri';
import pkg from '../utils/readPkg';
import { Settings } from '../models';
import CynModule from '../classes/cynModule';

import Build from './build';
import Preview from './preview';

const { version } = pkg;

const longest = (arr: string[]): number => arr.reduce(
  (a, b) => (a.length > b.length ? a : b),
).length;

export default class extends CynModule {
  name = 'help';

  description = 'Display this help';

  run = (args: mri.Argv, settings: Settings): boolean => {
    logger.log(`Cyn CLI v${version}\n`);

    const commands = [new Build(), new Preview()];

    if (args._.length === 2) {
      const helpCommand = args._[1];
      const cmd: CynModule | undefined = commands.find((c) => c.name === helpCommand);

      if (cmd) {
        const cliArgsPresent = cmd.cli && Array.isArray(cmd.cli) && cmd.cli.length > 0;
        logger.log(`Usage: cyn ${cmd.name} ${cliArgsPresent ? '[options]' : ''}`);
        logger.log();
        logger.log(cmd.description);

        if (cmd.cli) {
          logger.log();
          logger.log('Options:');
          cmd.cli.forEach((conf) => {
            let str = '  ';

            if (conf.shortcut) {
              str += `-${conf.shortcut}, `;
            }

            str += `--${conf.name}`;

            if (conf.boolean) {
              str += `, --no-${conf.name} <value:${!!conf.default}>`;
            } else {
              str += ' <value>';
            }

            str = str.padEnd(30);

            if (conf.description) {
              str += `${conf.description}`;
            }

            logger.log(str);
          });
          logger.log();
        }
      } else {
        logger.log('Command not found');
      }
    } else {
      logger.log('Usage: cyn <command> [options]');
      logger.log();
      logger.log('Options:');
      logger.log('  -h, --help');
      logger.log('  -d, --debug');
      logger.log('');
      logger.log('  -p, --profile <profileName>');
      logger.log('  -c, --config <pathToConfigFile>');
      logger.log();
      logger.log('Commands:');

      const commandsName = commands.map((module) => module.name);
      let padLength: number;
      if (commandsName && commandsName.length > 0) {
        padLength = longest(commandsName);
      } else {
        padLength = 0;
      }

      commands.forEach((cmd) => {
        logger.log(`  ${cmd.name.padEnd(padLength + 1)} ${cmd.description}`);
      });
    }
    return true;
  };
}
