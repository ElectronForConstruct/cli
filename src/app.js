const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Raven = require('raven');
const box = require('./box');
const { checkForUpdate } = require('./updateCheck');
const isDev = require('./isDev');
const actions = require('./prompt');
const PluginManager = require('./PluginManager');
const ConfigLoader = require('./ConfigLoader');

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
  Update using ${chalk.reset.bold.underline(`npm i -g ${update.name}`)}`));
    }

    if (isDev && fs.existsSync('MyGame')) process.chdir('MyGame');

    let isReady = false;
    let isElectron = false;

    // check configuration

    if (fs.existsSync(path.join(process.cwd(), 'config.js'))) {
      isElectron = true;
    }

    const settings = await configLoader.load();

    // check node_modules
    if (isElectron && !fs.existsSync(path.join(process.cwd(), 'node_modules', '@electronforconstruct', 'cli'))) {
      console.log(box(`${chalk.yellow('Whoops! Dependencies are not installed!')}
Please install them using ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`));
    } else {
      isReady = true;
    }

    const config = {
      settings,
      isReady,
      isElectron,
    };

    pm.setManagerConfig(config);

    await pm.loadDefaultCommands();
    if (isReady) await pm.loadCustomCommands();

    await pm.setModules(pm.commands);

    await pm.mergeDefaultConfig();

    const args = process.argv.slice(2);
    if (args.length === 1) {
      const command = pm.commands.find(c => c.id === args[0]);
      if (command) await command.run();
      else console.log('The command was not found');
    } else {
      await actions(pm);
    }

    console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));
  })
  .catch((e) => {
    console.error(
      'Failed to check for updates:', e,
    );
  });
