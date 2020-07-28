// import { cosmiconfig } from 'cosmiconfig';
import { cac } from 'cac';
import { cwd } from 'process';
import { dump } from 'dumper.js';
import fs from 'fs';
import path from 'path';
import TaskManager, { dispatchTask } from './classes/tasksManager';
import SettingsManager from './classes/settingsManager';

import add from './commands/add';

import Tasks from './tasks';
import { Args } from './models';

const cli = cac();

async function app(): Promise<void> {
  cli
    .option('-p, --profile <name>', 'Specify profile')
    .option('-c, --config <path>', 'Specify path to a configuration file')
    .option('-w, --watch', 'Watch for changes and restart')
    .option('-d, --debug', 'Output the resolved config file');

  const hm = TaskManager.getInstance();
  const sm = SettingsManager.getInstance();

  // --- Load config

  const parsed = cli.parse();
  let configFile;
  if (parsed.options.config) {
    console.log('Loading custom config');
    configFile = parsed.options.config;
  }
  await sm.loadConfig(parsed.options.profile, configFile);

  // --- Load Tasks

  // @ts-ignore
  hm.registerAll(Tasks);

  const availableTasks = Object.entries(sm.settings.tasks ?? {});
  availableTasks.forEach(([key, value]) => {
    // Make commands
    cli
      .command(key, value.description)
      .action(async (args: Args) => {
        const settings = sm.computeSettings();

        if (args.debug) {
          dump(settings);
        }

        const outputDirs = await dispatchTask(key, settings, 0, [cwd()]);
        console.log('outputDirs', outputDirs);
      });
  });

  // Load local commands and override any command made by the user
  const commands = [add];
  commands.forEach(({ name, description, callback }) => {
    cli
      .command(name, description)
      .action(callback);
  });

  cli.help();

  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  } catch (error) {
    console.log('Error reading package.json file');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  cli.version(pkg?.version ?? '0.0.0');

  // Run
  cli.parse();
}

export default app;
