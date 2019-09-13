const fs = require('fs');
const path = require('path');
const mri = require('mri');
const deepmerge = require('deepmerge');
const rollbar = require('./ErrorReport');

const userConfigPath = path.join(process.cwd(), 'config.js');
const PluginManager = require('./PluginManager');

const logger = require('./utils/console')
  .normal('system');

const isDev = process.env.CYN_ENV === 'development';

const pm = new PluginManager();

const shouldReportError = !isDev;
let errorReporting = false;

const alias = {
  h: 'help',
  p: 'profile',
};
const boolean = ['help'];

let args = mri(process.argv.slice(2), {
  alias,
  boolean,
});

let config = {
  isProject: false,
};

module.exports = async () => {
  try {
    const profile = args.profile || 'development';

    config.profile = profile;

    let userConfig = {};
    if (fs.existsSync(userConfigPath)) {
      config.isProject = true;
      userConfig = require(userConfigPath);
    }

    // todo support json
    const profileConfigPath = path.join(process.cwd(), `config.${profile}.js`);
    if (fs.existsSync(profileConfigPath)) {
      const profileConfig = require(profileConfigPath);
      userConfig = deepmerge(userConfig, profileConfig);
    }

    /**
     * -----------------------------------------------------------------------
     */

    await pm.loadCommands();

    let pluginsConfig = {};
    pm.getCommands()
      .forEach((command) => {
        pluginsConfig = deepmerge(pluginsConfig, { [command.name]: command.config || {} });
      });

    config = deepmerge.all([config, pluginsConfig, userConfig]);

    pm.setModules();
    pm.enhanceModules();

    /**
     * -----------------------------------------------------------------------
     */

    errorReporting = config.errorLogging;

    const aliases = pm.getAliases();
    const booleans = pm.getBooleans();
    const defaults = pm.getDefaults();

    args = mri(process.argv.slice(2), {
      alias: deepmerge(alias, aliases),
      boolean: [...boolean, ...booleans],
      default: defaults,
    });

    if (args.help || args.h || args._[0] === 'help' || args._.length === 0) {
      await pm.run('help', args);
    } else {
      if (!config.isProject && args._[0] !== 'new') {
        logger.error('Uh oh. This directory doesn\'t looks like an Cyn project!');
        return;
      }

      await pm.run(args._[0], args, config);
    }
  } catch (e) {
    logger.log('There was an error performing the current task.');
    if (errorReporting && shouldReportError) {
      const eventId = await rollbar.report(e, config, args);
      logger.log(`Please, open an issue and specify the following error code in your message: ${eventId}`);
    }

    logger.fatal(e);
  }
};
