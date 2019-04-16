const fs = require('fs');
const deepmerge = require('deepmerge');
const Sentry = require('@sentry/node');
const mri = require('mri');
const { USER_CONFIG } = require('./utils/ComonPaths');
const base = require('./DefaultConfig');
const PluginManager = require('./PluginManager');

const isDev = process.env.NODE_ENV === 'development' || false;

const pm = new PluginManager();

let errorReporting = !isDev;

const alias = {
  h: 'help',
  p: 'production',
};
const boolean = ['help', 'production'];

const argv = mri(process.argv.slice(2), {
  alias,
  boolean,
});

// const pUpdate = checkForUpdate();

module.exports = async () => {
  try {
    const config = {
      mixed: {
        isProject: false,
      },
    };

    // check if production or dev mode
    if (argv.production) {
      config.env = 'production';
    } else {
      config.env = 'development';
    }

    config.base = base(config.env === 'production');

    if (fs.existsSync(USER_CONFIG)) {
      const userConfig = require(USER_CONFIG);
      config.mixed.isProject = true;
      config.user = userConfig(config.env === 'production');
    }

    /**
     * -----------------------------------------------------------------------
     */

    // mix only plugins
    let userPlugins = [];
    if (config.user && config.user.plugins) {
      userPlugins = config.user.plugins;
    }
    config.mixed = deepmerge(config.base, config.mixed, { plugins: userPlugins });

    pm.setConfig(config); // already mixed config

    await pm.loadDefaultCommands();
    // if (isReady) await pm.loadCustomCommands();

    let mixedConfig = config.mixed;
    pm.getCommands().forEach((command) => {
      mixedConfig = deepmerge(mixedConfig, { [command.name]: command.config || {} });
    });

    if (config.user) {
      config.mixed = deepmerge(mixedConfig, config.user);
    } else {
      config.mixed = mixedConfig;
    }

    pm.setConfig(config);
    pm.setModules();

    /**
     * -----------------------------------------------------------------------
     */

    errorReporting = config.mixed.errorLogging;

    if (!isDev) {
      Sentry.configureScope((scope) => {
        scope.setExtra('config', config.mixed);
      });
    }

    const aliases = pm.getAliases();
    const booleans = pm.getBooleans();
    const defaults = pm.getDefaults();

    const args = mri(process.argv.slice(2), {
      alias: deepmerge(alias, aliases),
      boolean: [...boolean, ...booleans],
      default: defaults,
    });

    console.log();
    if (argv.help || argv.h || argv._[0] === 'help' || argv._.length === 0) {
      await pm.run('help', args);
    } else {
      if (!config.mixed.isProject && argv._[0] !== 'new') {
        console.log('Uh oh. This directory doesn\'t looks like an Electron project!');
        return;
      }

      await pm.run(args._[0], args, config.mixed);
    }
  } catch (e) {
    let lastEventId;
    if (errorReporting) {
      lastEventId = Sentry.captureException(e);
      console.log('There was an error performing the current task.');
      console.log(`Please, open an issue and specify the following error code in your message: ${lastEventId}`);
    }

    console.log();

    console.log(e);
  }
};
