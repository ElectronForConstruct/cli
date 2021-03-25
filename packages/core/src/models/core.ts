import {
  ComputedTask, Module, ComputedSettings, Ctx, Settings, Plugin, TaskStep,
} from '@cyn/utils';
import deepmerge from 'deepmerge';
import { dump } from 'dumper.js';

import {
  Listr, ListrTaskWrapper,
} from 'listr2';
import add from './add';
import ModuleManager from './ModuleManager';
import SettingsManager from './SettingsManager';
import { ObjToArr } from './utils';

// eslint-disable-next-line import/prefer-default-export
export class Core {
  moduleManager: ModuleManager

  settingsManager: SettingsManager

  constructor() {
    this.moduleManager = new ModuleManager();
    this.settingsManager = new SettingsManager();
  }

  async loadTasks() {
    // --- Load Tasks

    if (this.settingsManager.settings.plugins) {
      const { plugins } = this.settingsManager.settings;

      const pluginsToLoad: Promise<any>[] = [];
      if (plugins && Array.isArray(plugins) && plugins.length > 0) {
        for (let index = 0; index < plugins?.length ?? 0; index += 1) {
          const pluginName = plugins[index];

          const importedPlugin = await add(pluginName);
          pluginsToLoad.push(importedPlugin);
        }
      }

      const externalPlugins: Plugin[] = (
        await Promise.all(pluginsToLoad)
      );

      // eslint-disable-next-line
    const madeExternalModules = externalPlugins
        .filter((plugin) => plugin !== null)
        .map((plugin) => plugin.modules)
      // flatten
      // eslint-disable-next-line
      .reduce((acc, value) => acc.concat(value), [])

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      madeExternalModules.forEach((task) => {
        const name: string = task?.id ?? 'No Title';
        console.log(`Found module ${name}`);
      });

      this.registerAll(madeExternalModules);
    }
  }

  loadConfig(profile = '', directPath: string): Promise<void> {
    return this.settingsManager.loadConfig(profile, directPath);
  }

  computexxxConfiguration(): ComputedSettings {
    const settings: ComputedSettings = {};
    const { commands } = this.settingsManager.settings;

    if (!commands) {
      throw new Error('No tasks found');
    }

    const taskEntries = Object.entries(commands);

    taskEntries.forEach(([taskName, task]) => {
      const computedTask: ComputedTask = { ...task };

      const { steps } = task;
      steps.forEach((step, index) => {
        const { name, config: stepConfig } = step;

        // Check if config key exist
        if (!stepConfig) {
        // if (!config || !config?.[stepConfig]) {
          throw new Error(`No config entry "${name}" found for ${taskName}`);
        }
        // Set default config
        let computedSettings: any = this.moduleManager.get(name)?.config ?? {};

        // Get the default key
        computedSettings = deepmerge.all([computedSettings, stepConfig ?? {}]);

        // Merge default with current profile
        /* if (this.settingsManager.profile) {
          computedSettings = deepmerge.all(
            [
              computedSettings,
              // @ts-ignore
              stepConfig?.[this.profile] ?? {},
            ],
          );
        } */

        // computedSettings = deepmerge.all([]);
        computedTask.steps[index].config = { ...computedSettings };
      });

      // const resolvedConfig = this.resolveConfig(task, config);

      settings[taskName] = { ...task };
    });

    return settings;
  }

  getSettings(): Settings {
    return this.settingsManager.settings;
  }

  registerAll(modules: Module<unknown>[]): void {
    return this.moduleManager.registerAll(modules);
  }

  createTasks(command: string) {
    const configuration = this.settingsManager.settings;

    if (!configuration.commands) {
      console.info('No commands found');
      return;
    }

    if (!configuration.commands[command]) {
      console.info(`Command "${command}" not found`);
      return;
    }

    const module = configuration.commands[command];
    if (!module) {
      console.info(`No Tasks found for "${command}"`);
      return;
    }

    const { steps } = module;

    // console.log('steps', steps);

    const context: Ctx<unknown> = {
      workingDirectory: this.settingsManager.settings.input,
      settings: configuration,
      taskSettings: {},
      command,
    };
    const tasks = new Listr<Ctx<unknown>>(
      [],
      {
      // @ts-ignore
        renderer: (module.debug === true) ? 'verbose' : 'default',
        ctx: context,
      },
    );

    tasks.add({
      title: command,
      // @ts-ignore
      task: (ctx, t) => {
        const generatedTasks = this.fromTasksToListr(steps, t, context);

        return generatedTasks;
      },
      options: {
        bottomBar: 5,
      },
    });

    return tasks;
  }

  getCommands() {
    if (!this.settingsManager.settings.commands) {
      return [];
    }
    return ObjToArr(this.settingsManager.settings.commands, 'name');
  }

  fromTasksToListr(
    steps: TaskStep<unknown>[],
    task: ListrTaskWrapper<Ctx<unknown>, any>,
    ctx: Ctx<unknown>,
  ) {
    const generatedTasks = [];

    dump(steps);

    // eslint-disable-next-line no-restricted-syntax
    for (const step of steps) {
      if (!step) {
        console.info('Invalid step');
        return;
      }

      const moduleInstanceForStep = this.moduleManager.get(step.name);
      if (moduleInstanceForStep) {
        // @ts-ignore
        const taskSettings = deepmerge.all([moduleInstanceForStep.config ?? {}, step.config ?? {}]);
        console.log('taskSettings', taskSettings);

        ctx.taskSettings = taskSettings;

        const { tasks: instanceTasks } = moduleInstanceForStep;

        console.log('instanceTasks', instanceTasks);
        // aaaaa;
        generatedTasks.push(...instanceTasks);
      }
      console.error(`Cannot find Task ${step.name}`);
    }

    return task.newListr(generatedTasks, {
      rendererOptions: { collapse: false },
      ctx,
    });
  }

  getTasks(command: string) {
    const tasks = this.createTasks(command);

    if (!tasks) {
      return null;
    }

    return tasks;
  }
}
