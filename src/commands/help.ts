import log from 'signale';
import pkg from '../utils/readPkg';
import { CynModule } from '../models';

const { version } = pkg;

const longest = (arr: string[]): number => arr.reduce(
  (a, b) => (a.length > b.length ? a : b),
).length;

const command: CynModule = {
  name: 'help',
  description: 'Display this help',

  run(args) {
    log.log(`Electron for Construct cli v${version}\n`);
    if (args._.length === 1 && args._[0] !== 'help') {
      const cmd = this.modules?.find((c) => c.name === args._[0]);

      if (cmd) {
        log.log(`Usage: efc ${cmd.name} [options]`);
        log.log();
        log.log(cmd.description);

        if (cmd.cli) {
          log.log();
          log.log('Options:');
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

            log.log(str);
          });
          log.log();
        }
      } else {
        log.log('Command not found');
      }
    } else {
      log.log('Usage: efc <command> [options]');
      log.log();
      log.log('Options:');
      log.log('  -p, --profile <profileName>');
      log.log();
      log.log('Commands:');

      const commandsName = this.modules?.map((module) => module.name);
      let padLength: number;
      if (commandsName && commandsName.length > 0) {
        padLength = longest(commandsName);
      } else {
        padLength = 0;
      }
      // eslint-disable-next-line
      this.modules?.forEach((cmd) => {
        log.log(`  ${cmd.name.padEnd(padLength + 1)} ${cmd.description}`);
      });
    }
    return true;
  },
};
export default command;
