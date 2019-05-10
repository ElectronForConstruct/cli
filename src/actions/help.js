const log = require('signale');
const { version } = require('../../package');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'help',
  description: 'Display this help',

  run(args) {
    log.log(`Electron for Construct cli v${version}\n`);
    if (args._.length === 1 && args._[0] !== 'help') {
      const cmd = this.modules.find(c => c.name === args._[0]);

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
      log.log('Commands:');
      this.modules.forEach((cmd) => {
        log.log(`  ${cmd.name.padEnd(20)} ${cmd.description}`);
      });
    }
  },
};
