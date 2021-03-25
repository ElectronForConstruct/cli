import { Module } from '@cyn/utils';

export default class ModuleManager {
  private modules: Module<unknown>[] = [];

  register(task: Module<unknown>): number {
    return this.modules.push(task);
  }

  registerAll(modules: Module<unknown>[]): void {
    for (let i = 0; i < modules.length; i += 1) {
      this.register(modules[i]);
    }
  }

  listAll(): Module<unknown>[] {
    return this.modules;
  }

  get(moduleName: string): Module<unknown> | undefined {
    return this.modules.find((task) => task.id === moduleName);
  }
}
