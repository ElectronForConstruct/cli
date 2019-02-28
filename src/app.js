import chalk from 'chalk';
import fs from 'fs';
import box from './box';
import { checkForUpdate } from './updateCheck';
import isDev from './isDev';
import actions from './prompt';
import PluginManager from './PluginManager';

const pm = new PluginManager();

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

    let isReady = true;
    let isElectron = false;

    // check configuration

    if (fs.existsSync('./config.js')) {
      isElectron = true;

      // check node_modules
      if (!fs.existsSync('./node_modules')) {
        isReady = false;
        console.log(box(`${chalk.yellow('Whoops! Dependencies are not installed!')}
Please install them using ${chalk.underline('npm install')} or ${chalk.underline('yarn install')}`));
      }
    }

    const config = {
      config: null,
      isReady,
      isElectron,
    };

    await pm.loadDefaultCommands(config);
    // pm.loadCustomCommands(config);

    const args = process.argv.slice(2);
    if (args.length === 1) {
      const command = pm.commands.find(c => c.id === args[0]);
      if (command) await command.run();
      else console.log('The command was not found');
      return;
    }

    await actions(pm);
  })
  .catch((e) => {
    console.error(
      `Failed to check for updates: ${e}`,
    );
  });
