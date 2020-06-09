import { Settings } from '../models';
import Hook from './hook';
import SettingsManager from './settingsManager';

// createLogger(interactive = false): Signale {
//   return createLogger({
//     scope: this.name,
//     interactive,
//   });
// }

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
  ...hookArguments: unknown[]
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
        // @ts-ignore
        const args = [...hookArguments, settings[step.config]];
        await hookInst.run(...args);
      } else {
        console.log(`Cannot find hook ${step.step}`);
      }
    }
    return [];
  }
  console.log(`No hooks found for "${hookName}"`);
  return [];
}
