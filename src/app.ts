// import { cosmiconfig } from 'cosmiconfig';
import { cac } from 'cac';
import HookManager from './classes/hooksManager';
import SettingsManager from './classes/settingsManager';
import build from './commands/build';

import hooks from './hooks';

const cli = cac();

async function app(): Promise<void> {
  cli
    .option('-p, --profile <name>', 'Specify profile')
    .option('-c, --config <path>', 'Specify path to a configuration file')
    .option('-d, --debug', 'Output the resolved config file');


  const hm = HookManager.getInstance();
  const sm = SettingsManager.getInstance();

  // --- Load config

  const parsed = cli.parse();
  let configFile;
  if (parsed.options.config) {
    console.log('Loading custom config');
    configFile = parsed.options.config;
  }
  await sm.loadConfig(parsed.options.profile, configFile);

  // --- Load hooks

  // @ts-ignore
  hm.registerAll(hooks);

  // Make commands

  cli.command('')
    .action(() => {
      cli.outputHelp();
    });

  cli
    .command('build', 'Build your app')
    .action(build);

  cli
    .command('dev', 'Preview your app without bundling')
    .option('-w, --watch', 'Watch for changes and restart')
    .action((files, options) => {
      console.log(files, options);
      console.log('start running');
    });

  cli.help();
  cli.version('0.0.0');

  // Run
  cli.parse();
}

export default app;
