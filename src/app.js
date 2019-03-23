const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const chalk = require('chalk');
const fs = require('fs');
const Sentry = require('@sentry/node');
const deepmerge = require('deepmerge');
const os = require('os');
const { USER_CONFIG } = require('./utils/ComonPaths');
const pkg = require('../package.json');
const box = require('./box');
const { checkForUpdate } = require('./updateCheck');
const actions = require('./prompt');
const { PluginManager, ConfigLoader } = require('./core');

const pm = new PluginManager(path.join(__dirname, 'actions'));
const configLoader = new ConfigLoader();

const isDev = process.env.NODE_ENV === 'development' || false;

if (isDev) {
  console.log('Running in development');
} else {
  Sentry.init({
    dsn: 'https://847cb74dd8964d4f81501ed1d29b18f6@sentry.io/1406240',
  });

  Sentry.configureScope((scope) => {
    scope.setExtra('os', os.platform());
    scope.setExtra('arch', os.arch());
    scope.setExtra('hostname', os.hostname());
    scope.setExtra('cliVersion', pkg.version);
  });
}

let errorReporting = !isDev;

checkForUpdate()
  .then(async (update) => {
    if (update) {
      console.log(box(`
  ${chalk.redBright('You are using an outdated version of this tool')}
      
  The latest version is ${chalk.yellow.bold.underline(update)}.
  Update using ${chalk.reset.bold.underline(`npm i -g ${pkg.name}`)}`));
    }

    try {
      let isProject = false;

      if (fs.existsSync(USER_CONFIG)) {
        isProject = true;
      }

      const { mixed, base, user } = await configLoader.load();

      errorReporting = mixed.errorLogging;

      if (!isDev) {
        Sentry.configureScope((scope) => {
          scope.setExtra('config', mixed);
        });
      }

      const config = {
        mixed,
        base,
        user,
        isProject,
      };

      /**
       * -----------------------------------------------------------------------
       */

      pm.setDefaultConfig(config); // already mixed config

      await pm.loadDefaultCommands();
      // if (isReady) await pm.loadCustomCommands();

      let mixedConfig = config.base;
      pm.getCommands().forEach((command) => {
        mixedConfig = deepmerge(mixedConfig, command.defaultConfiguration);
      });

      config.mixed = deepmerge(mixedConfig, config.user);

      pm.setDefaultConfig(config);
      pm.setModules();

      /**
       * -----------------------------------------------------------------------
       */

      const args = process.argv.slice(2);
      if (args.length >= 1) {
        const command = pm.getCommands().find(c => c.id === args[0]);

        if (command) { await command.run({ ...args.slice(1) }); } else {
          console.log('The command was not found');
          await pm.get('help').run();
        }
      } else {
        await actions(pm);
      }

      console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
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
  }).catch((e) => {
    console.error(
      'Failed to check for updates:', e,
    );
  });
