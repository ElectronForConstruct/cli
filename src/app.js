const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Raven = require('raven');
const deepmerge = require('deepmerge');
const os = require('os');
const { USER_CONFIG, USER_PACKAGE_JSON } = require('./utils/ComonPaths');
const pkg = require('../package');
const box = require('./box');
const { checkForUpdate } = require('./updateCheck');
const isDev = require('./utils/isDev');
const actions = require('./prompt');
const PluginManager = require('./classes/PluginManager');
const ConfigLoader = require('./classes/ConfigLoader');

const pm = new PluginManager();
const configLoader = new ConfigLoader();

Raven.config('https://847cb74dd8964d4f81501ed1d29b18f6@sentry.io/1406240').install();

if (isDev) {
  console.log('Running in developement mode');
}

checkForUpdate()
  .then(async (update) => {
    if (update) {
      console.log(box(`
  ${chalk.redBright('You are using an outdated version of this tool')}
      
  The latest version is ${chalk.yellow.bold.underline(update.version)}.
  Update using ${chalk.reset.bold.underline(`npm i -g ${pkg.name}`)}`));
    }

    try {
      let isReady = false;
      let isElectron = false;

      if (fs.existsSync(USER_CONFIG)) {
        isElectron = true;
      }

      const { mixed, base, user } = await configLoader.load();

      Raven.setContext({
        os: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        config: mixed,
        cliVersion: pkg.version,
        templateVersion: (isReady && isElectron) ? require(USER_PACKAGE_JSON).version : 'No version foud',
      });

      // check node_modules
      if (isElectron && !fs.existsSync(path.join(process.cwd(), 'node_modules', '@efc', 'cli'))) {
        console.log(box(`${chalk.yellow('Whoops! Dependencies are not installed!')}
Please install them using ${chalk.underline('efc config')}`));
      } else {
        isReady = true;
      }

      const config = {
        mixed,
        base,
        user,
        isReady,
        isElectron,
      };

      /**
       * -----------------------------------------------------------------------
       */

      pm.setDefaultConfig(config); // already mixed config

      await pm.loadDefaultCommands();
      if (isReady) await pm.loadCustomCommands();

      let mixedConfig = config.base;
      pm.getCommands().forEach((command) => {
        mixedConfig = deepmerge(mixedConfig, command.defaultConfiguration);
      });

      config.mixed = deepmerge(mixedConfig, config.user);

      pm.setDefaultConfig(config);

      /**
       * -----------------------------------------------------------------------
       */

      const args = process.argv.slice(2);
      if (args.length === 1) {
        const command = pm.getCommands().find(c => c.id === args[0]);

        if (command) await command.run();
        else {
          console.log('The command was not found');
          await pm.get('help').run();
        }
      } else {
        await actions(pm);
      }

      console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
    } catch (e) {
      console.error('An error occured', e);
      Raven.captureException(e);
    }
  })
  .catch((e) => {
    console.error(
      'Failed to check for updates:', e,
    );
  });
