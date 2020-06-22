// import { cosmiconfig } from 'cosmiconfig';
import { cac } from 'cac';
import { cwd } from 'process';
import { dump } from 'dumper.js';
import HookManager, { dispatchHook } from './classes/hooksManager';
import SettingsManager from './classes/settingsManager';

import hooks from './hooks';

const cli = cac();

interface Args {
  p: string;
  profile: string

  c: string;
  config: string

  d: boolean
  debug: boolean

  w: boolean
  watch: boolean
}

async function app(): Promise<void> {
  cli
    .option('-p, --profile <name>', 'Specify profile')
    .option('-c, --config <path>', 'Specify path to a configuration file')
    .option('-w, --watch', 'Watch for changes and restart')
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

  const availableHooks = Object.entries(sm.settings.tasks ?? {});
  availableHooks.forEach(([key, value]) => {
    // Make commands
    cli.command(key, value.description)
      .action(async (args: Args) => {
        const { settings } = sm;

        if (args.debug) {
          dump(settings);
        }

        const outputDirs = await dispatchHook(key, 0, [cwd()]);
        console.log('outputDirs', outputDirs);
      });
  });

  cli.help();
  cli.version('0.0.0');

  // Run
  cli.parse();
}

export default app;
