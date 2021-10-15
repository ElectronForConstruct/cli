import { AModule } from './utils';

export default class ModuleManager {
  private modules: Map<string, AModule<unknown, unknown>> =
    new Map<string, AModule<unknown, unknown>>();

  register(key: string, module: AModule<unknown, unknown>) {
    return this.modules.set(key, module);
  }

  listAll() {
    return this.modules;
  }

  get(moduleName: string) {
    return this.modules.get(moduleName);
  }
}
