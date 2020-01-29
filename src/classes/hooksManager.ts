import { CynModule, CynModuleWrapper } from '../models';

export default class HookManager {
  private static instance: HookManager;

  private hooks: Hook[];

  static getInstance(): HookManager {
    if (!HookManager.instance) {
      HookManager.instance = new HookManager();
    }
    return HookManager.instance;
  }

  register(): boolean {
    return true;
  }

  dispatch(): Promise<boolean> | boolean {
    return true;
  }
}
