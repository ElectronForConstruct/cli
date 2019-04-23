// TODO https://github.com/pmq20/node-packer

const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');
const mri = require('mri');
const rollbar = require('./ErrorReport');

const USER_CONFIG = path.join(process.cwd(), 'config.js');
const base = require('./DefaultConfig');
const PluginManager = require('./PluginManager');

const logger = require('./utils/console').normal('system');

const isDev = process.env.NODE_ENV === 'development' || false;

const pm = new PluginManager();

const shouldReportError = !isDev;
let errorReporting = false;

const alias = {
  h: 'help',
  p: 'production',
};
const boolean = ['help', 'production'];

let args = mri(process.argv.slice(2), {
  alias,
  boolean,
});

let config = {
  isProject: false,
};

module.exports = async () => {
  try {
    // check if production or dev mode
    if (args.production) {
      config.env = 'production';
    } else {
      config.env = 'development';
    }

    const baseConfig = base(config.env === 'production');

    let userConfig = {};
    if (fs.existsSync(USER_CONFIG)) {
      const usrConfig = require(USER_CONFIG);
      config.isProject = true;
      userConfig = usrConfig(config.env === 'production');
    }

    /**
     * -----------------------------------------------------------------------
     */

    // mix only plugins
    const userPlugins = [];
    if (userConfig && userConfig.plugins) {
      userPlugins.push(...userConfig.plugins);
    }
    userPlugins.push(...baseConfig.plugins);

    await pm.loadDefaultCommands(userPlugins);
    // if (isReady) await pm.loadCustomCommands();

    let pluginsConfig = {};
    pm.getCommands().forEach((command) => {
      pluginsConfig = deepmerge(pluginsConfig, { [command.name]: command.config || {} });
    });

    config = deepmerge.all([config, baseConfig, pluginsConfig, userConfig]);

    pm.setModules();

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
        logger.error('Uh oh. This directory doesn\'t looks like an Electron project!');
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
