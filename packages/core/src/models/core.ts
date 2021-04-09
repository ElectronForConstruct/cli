import {
  ComputedTask, ComputedSettings, Settings, Plugin, Ctx,
} from '@cyn/utils';
import deepmerge from 'deepmerge';
import { dump } from 'dumper.js';
import { cloneDeep } from 'lodash';

import path from 'path';
import add from './add';
import { Command } from './command';
import ModuleManager from './ModuleManager';
import { ObjToArr } from './utils';

// eslint-disable-next-line import/prefer-default-export
export class Core {
  modules: ModuleManager

  settings: Settings

  constructor() {
    this.modules = new ModuleManager();
    this.settings = {
      input: './src',
    };
  }

  setInput(input: string) {
    this.settings.input = path.resolve(input);
    return this;
  }

  createCommand(name: string) {
    return new Command(name);
  }

  registerPlugin(plugin: Plugin) {
    console.log('module', plugin);
    Object.entries(plugin).forEach(([key, module]) => {
      this.modules.register(key, module);
    });
    return this;
  }

  async run(command: Command) {
    const { steps, name } = command;

    const outputs: Record<string, any> = {};

    // eslint-disable-next-line no-restricted-syntax
    for await (const step of steps) {
      const { name: stepName, inputs: stepInputs } = step;

      const plugin = this.modules.get(step.name);
      if (plugin) {
        const { input: pluginInputs, run } = plugin;

        // TODO insude fn
        const baseSettings: Record<string, any> = {};
        Object.entries(pluginInputs).forEach(([key, value]) => {
          baseSettings[key] = (value as any).default ?? '';
        });

        const stepSettings: Record<string, any> = {};
        stepInputs.forEach((value, key) => {
          if (typeof value === 'function') {
            console.log('is a functions, passing', outputs);
            // eslint-disable-next-line
            stepSettings[key] = value(outputs);
          } else {
            stepSettings[key] = value;
          }
        });

        console.log('stepSettings', stepSettings);

        const taskSettings = deepmerge.all([baseSettings, stepSettings]);

        const ctx: Ctx<unknown> = {
          command: '',
          settings: this.settings,
          taskSettings,
          workingDirectory: '',
        };
        const output = await run(ctx);

        console.log('task output', output);

        console.log('step.outputs', step.outputs);

        step.outputs.forEach((value, key) => {
          outputs[value] = output[key];
        });
        console.log('outputs2', outputs);
      }
    }
  }

  // ----

  /* async loadTasks() {
    // --- Load Tasks

    if (this.settings.plugins) {
      const { plugins } = this.settings;

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
      });

      this.registerAll(madeExternalModules);
    }
  } */

  loadSettings(settings: Settings): Core {
    this.settings = settings;
    return this;
  }

  computexxxConfiguration(): ComputedSettings {
    const settings: ComputedSettings = {};
    const { commands } = this.settings;

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
        let computedSettings: any = this.modules.get(name)?.config ?? {};

        // Get the default key
        computedSettings = deepmerge.all([computedSettings, stepConfig ?? {}]);

        // Merge default with current profile
        /* if (this.profile) {
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
    return this.settings;
  }

  // registerAll(modules: Module<unknown>[]): void {
  //   return this.plugins.registerAll(modules);
  // }

  // createTasks(command: string) {
  //   const configuration = this.settings;

  //   if (!configuration.commands) {
  //     console.info('No commands found');
  //     return;
  //   }

  //   if (!configuration.commands[command]) {
  //     console.info(`Command "${command}" not found`);
  //     return;
  //   }

  //   const module = configuration.commands[command];
  //   if (!module) {
  //     console.info(`No Tasks found for "${command}"`);
  //     return;
  //   }

  //   const { steps } = module;

  //   const context: Ctx<unknown> = {
  //     workingDirectory: this.settings.input,
  //     settings: configuration,
  //     taskSettings: {},
  //     command,
  //   };

  //   return tasks;
  // }

  getCommands() {
    if (!this.settings.commands) {
      return [];
    }
    return ObjToArr(this.settings.commands, 'name');
  }

  // getTasks(command: string) {
  //   const tasks = this.createTasks(command);

  //   if (!tasks) {
  //     return null;
  //   }

  //   return tasks;
  // }
}
