import {
  Settings, Plugin,
} from '@cyn/utils';

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
    return new Command(name, this.settings);
  }

  registerPlugin(plugin: Plugin) {
    console.log('module', plugin);
    Object.entries(plugin).forEach(([key, module]) => {
      this.modules.register(key, module);
    });
    return this;
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
