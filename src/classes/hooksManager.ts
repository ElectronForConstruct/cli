import deepmerge from 'deepmerge';
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
  currentStep = 0,
  sources: string[],
): Promise<string[]> {
  const results: string[] = [];

  const sm = SettingsManager.getInstance();

  const settings = sm.computeSettings();
  const { tasks } = settings;
  if (!tasks) {
    console.log(`No hooks found for "${hookName}"`);
    return [];
  }

  const { steps } = tasks[hookName];

  const step = steps[currentStep];

  if (!step) {
    return sources;
  }

  const hookInst = HookManager.getInstance().get(step.name);
  if (hookInst) {
    // @ts-ignore
    const hookSettings = deepmerge.all([hookInst.config ?? {}, step.config ?? {}]);

    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
      const source = sources[sourceIndex];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const args = { settings, hookSettings, workingDirectory: source };
      const { sources: nextSources } = await hookInst.run(args);
      // console.log('nextSources', nextSources);
      const outDirs = await dispatchHook(hookName, currentStep + 1, nextSources);
      results.push(...outDirs);
    }
  } else {
    console.log(`Cannot find hook ${step.name}`);
  }
  return results;
}
