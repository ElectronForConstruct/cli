import { createScopedLogger, Task } from '@cyn/utils';
import { cac } from 'cac';
import { Listr } from 'listr2';
import { dump } from 'dumper.js';
import fs from 'fs-extra';
import path from 'path';
import TaskManager, { startTasks } from './classes/tasksManager';
import SettingsManager from './classes/settingsManager';

import add from './utils/add';

import { Args } from './models';

interface Ctx {
  /* some variables for internal use */
}

const tasks = new Listr<Ctx>(
  [
    /* tasks */
  ],
  {
    /* options */
  },
);

const cli = cac();

const logger = createScopedLogger('system');

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
    logger.info('Loading custom config');
    configFile = parsed.options.config;
  }
  await sm.loadConfig(parsed.options.profile, configFile);

  logger.info('sm.settings', sm.settings);

  // --- Load Tasks

  if (sm.settings?.plugins) {
    const { plugins } = sm.settings;

    const taskToLoad: Promise<any>[] = [];
    if (plugins && Array.isArray(plugins) && plugins.length > 0) {
      for (let index = 0; index < plugins?.length ?? 0; index += 1) {
        const pluginName = plugins[index];

        const importedTask = await add(pluginName);
        taskToLoad.push(importedTask);
      }
    }

    logger.info('after');

    const externalTasks: (typeof Task)[] = await Promise.all(taskToLoad);
    // eslint-disable-next-line
    const madeExternalTasks: Task[] = externalTasks
      .filter((taskSetup) => taskSetup !== null)
      // @ts-ignore
      .map((taskSetup) => taskSetup.default.tasks)
      // flatten
      // eslint-disable-next-line
      .reduce((acc, value) => acc.concat(value), [])
      // @ts-ignore
      // eslint-disable-next-line
      .map((TaskSetting: typeof Task) => new TaskSetting());

    madeExternalTasks.forEach((task: Task) => {
      logger.info(`Task found: ${task.id}`);
    });

    hm.registerAll(madeExternalTasks);
  }

  if (sm.settings?.tasks) {
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

          try {
            const outputDirs = await startTasks(key, settings, sm.settings.input ?? './src');
          } catch (e) {
            // it will collect all the errors encountered if { exitOnError: false }
            // is set as an option but will not throw them
            // elsewise it will throw the first error encountered as expected
            console.error(e);
          }
        });
    });
  }

  // Load local commands and override any command made by the user
  const commands: any[] = [];
  commands.forEach(({ name, description, callback }) => {
    cli
      .command(name, description)
      .action(callback);
  });

  cli.help();

  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  } catch (error) {
    logger.info('Error reading package.json file');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  cli.version(pkg?.version ?? '0.0.0');

  // Run
  cli.parse();
}

export default app;
