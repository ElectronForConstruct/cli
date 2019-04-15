const Command = require('../Command');

/**
 *
 * @type {module.Command}
 */
module.exports = class extends Command {
  constructor() {
    super('crash-reporter', 'Configure crash reporter');
    this.setDefaultConfiguration({});
  }

  isVisible() {
    return true;
  }

  onPreBuild() {
    const { settings } = this;
    const crashReporter = settings['crash-reporter'];
    if (!crashReporter.enable) {
      console.log('crash reporter is not enabled.');
      return;
    }

    if (!crashReporter.companyName || !crashReporter.submitURL) {
      throw new Error('"crash-reporter.companyName" and "crash-reporter.submitURL" are required in order to enable the crash reporter');
    }
  }

  async run() {
    console.log('Please, see https://efc.armaldio.xyz/plugins/crash-reporter.html for information on how to configure this plugin');
  }
};
