const log = require('../utils/console').normal('crash-reporter');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'crash-reporter',
  description: 'Configure crash reporter',

  onPreBuild(args, settings) {
    const crashReporter = settings['crash-reporter'];
    if (!crashReporter.enable) {
      log.info('crash reporter is not enabled.');
      return;
    }

    if (!crashReporter.companyName || !crashReporter.submitURL) {
      throw new Error('"crash-reporter.companyName" and "crash-reporter.submitURL" are required in order to enable the crash reporter');
    }
  },

  async run() {
    log.info('Please, see https://efc.armaldio.xyz/plugins/crash-reporter.html for information on how to configure this plugin');
  },
};
