const { Signale } = require('signale');

module.exports = {
  show: (options) => {
    const log = new Signale(options);
    log.config({
      displayLabel: false,
    });
    return log;
  },
  normal: (scope) => module.exports.show({
    scope,
  }),
  interactive: (scope) => module.exports.show({
    scope,
    interactive: true,
  }),
};
