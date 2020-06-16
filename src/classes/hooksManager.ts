import deepmerge, { all } from 'deepmerge';
import Hook from './hook';
import SettingsManager from './settingsManager';

export default class HookManager {
  private static instance: HookManager

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

  listAll(): Hook[] {
    return this.hooks;
  }

  get(hookName: string): Hook | undefined {
    return this.hooks.find((hook) => hook.name === hookName);
  }
}

export async function dispatchHook(
  hookName: string,
  workingDirectory: string,
): Promise<boolean[]> {
  const sm = SettingsManager.getInstance();

  const settings = sm.computeSettings();
  const { on } = settings;
  if (!on) {
    console.log(`No hooks found for "${hookName}"`);
    return [];
  }
  const steps = on[hookName];
  if (steps) {
    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      const hookInst = HookManager.getInstance().get(step.step);
      if (hookInst) {
        let hookSettings;
        // @ts-ignore
        if (step.config) {
          // @ts-ignore
          hookSettings = deepmerge.all([hookInst.config ?? {}, step.config]);
        } else {
          hookSettings = hookInst.config ?? {};
        }
        const args = { workingDirectory, settings, hookSettings };
        await hookInst.run(args);
      } else {
        console.log(`Cannot find hook ${step.step}`);
      }
    }
    return [];
  }
  console.log(`No hooks found for "${hookName}"`);
  return [];
}
