import Hook from './hook';
import SettingsManager from './settingsManager';

// createLogger(interactive = false): Signale {
//   return createLogger({
//     scope: this.name,
//     interactive,
//   });
// }

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
    console.log('registering', hook);
    return this.hooks.push(hook);
  }

  registerAll(hooks: Hook[]): void {
    for (let i = 0; i < hooks.length; i += 1) {
      this.register(hooks[i]);
    }
  }

  listAll(): Hook[] {
    return this.hooks;
  }

  dispatch(hookName: string, hookArguments: unknown): Promise<boolean[]> | boolean[] {
    const hooks: Hook[] = this.get(hookName);
    console.log(`mathing hooks [${hookName}]`, hooks);
    const promises: Promise<boolean>[] = [];
    for (let i = 0; i < hooks.length; i += 1) {
      promises.push(hooks[i].run(hookArguments));
    }
    return Promise.all(promises);
  }

  get(hookName: string): Hook[] {
    return this.hooks.filter((hook) => hook.bind === hookName);
  }
}

export function dispatchHook(
  hookName: string,
  hookArguments: unknown,
): Promise<boolean[]> | boolean[] {
  const sm = SettingsManager.getInstance();

  const { settings } = sm;
  const { on } = settings;
  const hook = on[hookName];
  I was here trying to dispatch hooks
  if (hook) {
    const { steps } = hook;
    console.log('Found steps');
    console.log(steps);
    return HookManager.getInstance().dispatch(hookName, hookArguments);
  }
  console.log(`No hooks found for "${hookName}"`);
  return [];
}
