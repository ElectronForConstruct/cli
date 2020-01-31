import Hook from './hook';

export default class HookManager {
  private static instance: HookManager;

  private hooks: Hook[] = [];

  static getInstance(): HookManager {
    if (!HookManager.instance) {
      HookManager.instance = new HookManager();
    }
    return HookManager.instance;
  }

  register(hook: Hook): number {
    return this.hooks.push(hook);
  }

  registerAll(hooks: Hook[]): void {
    for (let i = 0; i < hooks.length; i += 1) {
      this.register(hooks[i]);
    }
  }

  dispatch(hookName: string, hookArguments: unknown): Promise<boolean[]> | boolean[] {
    const hooks: Hook[] = this.get(hookName);
    const promises: Promise<boolean>[] = [];
    for (let i = 0; i < hooks.length; i += 1) {
      promises.push(hooks[i].run(hookArguments));
    }
    return Promise.all(promises);
  }

  get(hookName: string): Hook[] {
    return this.hooks.filter((hook) => hook.name === hookName);
  }
}
