import { Module } from '@cyn/utils';

export default class ModuleManager {
  private modules: Map<string, Module<unknown>> = new Map();

  register(key: string, module: Module<unknown>) {
    return this.modules.set(key, module);
  }

  listAll() {
    return this.modules;
  }

  get(moduleName: string) {
    return this.modules.get(moduleName);
  }
}
