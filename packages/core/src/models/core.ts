import ModuleManager from './moduleManager';
import { Settings, Plugin } from './utils';

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
}
