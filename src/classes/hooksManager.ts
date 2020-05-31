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

  get(hookName: string): Hook | undefined {
    return this.hooks.find((hook) => hook.name === hookName);
  }
}

export async function dispatchHook(
  hookName: string,
  hookArguments: unknown,
): Promise<boolean[]> {
  const sm = SettingsManager.getInstance();

  const { settings } = sm;
  const { on } = settings;
  const hook = on[hookName];
  if (hook) {
    const { steps } = hook;
    console.log('Found steps');
    console.log(steps);
    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      console.log('step', step);
      const hookInst = HookManager.getInstance().get(step);
      if (hookInst) {
        await hookInst.run(hookArguments);
      } else {
        console.log(`Cannot find hook ${step}`);
      }
    }
    return [];
  }
  console.log(`No hooks found for "${hookName}"`);
  return [];
}
