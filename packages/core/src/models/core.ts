import {
  Settings, Plugin, Ctx,
} from '@cyn/utils';
import deepmerge from 'deepmerge';

import path from 'path';
import { Command } from './command';
import ModuleManager from './moduleManager';
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

  loadSettings(settings: Settings): Core {
    this.settings = settings;
    return this;
  }

  getSettings(): Settings {
    return this.settings;
  }

  getCommands() {
    if (!this.settings.commands) {
      return [];
    }
    return ObjToArr(this.settings.commands, 'name');
  }
}
