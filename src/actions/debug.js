/**
 * @type EFCModule
 */
module.exports = {
  name: 'debug',
  description: 'Show current configuration',

  run(args, config) {
    const { dump } = require('dumper.js');
    dump(config);
  },
};
