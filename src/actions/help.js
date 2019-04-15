module.exports = {
  name: 'help',
  description: 'Display this help',

  run(args) {
    console.log();
    console.log('Usage: efc <command> [options] [args...]');
    console.log();
    console.log('Commands:');

    if (args._.length === 1 && args._[0] !== 'help') {
      const cmd = this.modules.find(c => c.name === args._[0]);
      if (cmd) {
        console.log(`  efc ${(cmd.usage || cmd.name).padEnd(50)} ${cmd.description}`);

        console.log();

        console.log('Parameters:');
        Object.keys(cmd.cli).forEach((conf) => {
          console.log(`- ${conf}:`);
          Object.entries(cmd.cli[conf]).forEach((items) => {
            console.log(`  - ${items[0]}: ${items[1]}`);
          });
        });

        console.log();

        if (cmd.config) {
          console.log('Default configuration:');
          Object.entries(cmd.config).forEach((conf) => {
            console.log(`  - ${conf[0]}: ${JSON.stringify(conf[1], null, '  ')}`);
          });
        }

        console.log();
      } else {
        console.log('Command not found');
      }
    } else {
      this.modules.forEach((cmd) => {
        console.log(`  efc ${(cmd.usage || cmd.name).padEnd(50)} ${cmd.description}`);
      });
    }
  },
};
