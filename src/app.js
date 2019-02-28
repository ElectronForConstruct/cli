import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
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

    let isReady = false;
    let isElectron = false;

    // check configuration

    let settings = {};
    if (fs.existsSync(path.join(process.cwd(), 'config.js'))) {
      isElectron = true;

      // eslint-disable-next-line
      settings = await import(path.join(process.cwd(), 'config.js'));
    }

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

    await pm.loadDefaultCommands(config);
    if (isReady) await pm.loadCustomCommands(config);

    await pm.setModules(pm.commands);

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
      'Failed to check for updates:', e,
    );
  });
