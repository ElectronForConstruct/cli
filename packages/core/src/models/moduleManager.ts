import { Module } from '@cyn/utils';

export default class ModuleManager {
  private modules: Map<string, Module<unknown, unknown>> =
    new Map<string, Module<unknown, unknown>>();

  register(key: string, module: Module<unknown, unknown>) {
    return this.modules.set(key, module);
  }

  listAll() {
    return this.modules;
  }

  get(moduleName: string) {
    return this.modules.get(moduleName);
  }
}
