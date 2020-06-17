// import { cosmiconfig } from 'cosmiconfig';
import { cac } from 'cac';
import HookManager, { dispatchHook } from './classes/hooksManager';
import SettingsManager from './classes/settingsManager';

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

  const availableHooks = Object.entries(sm.settings.on ?? {});
  console.log('availableHooks', availableHooks);
  availableHooks.forEach(([key, value]) => {
    // Make commands

    cli.command(key, value.description)
      .action(() => dispatchHook(key));
  });

  // cli
  //   .command('dev', 'Preview your app without bundling')
  //   .option('-w, --watch', 'Watch for changes and restart')

  cli.help();
  cli.version('0.0.0');

  // Run
  cli.parse();
}

export default app;
