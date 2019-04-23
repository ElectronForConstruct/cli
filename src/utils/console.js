const { Signale } = require('signale');

module.exports = {
  normal: (scope) => {
    const options = {
      scope,
    };
    const log = new Signale(options);
    log.config({
      displayLabel: false,
    });
    return log;
  },
  interactive: (scope) => {
    const options = {
      scope,
      interactive: true,
    };
    const log = new Signale(options);
    log.config({
      displayLabel: false,
    });
    return log;
  },
};
