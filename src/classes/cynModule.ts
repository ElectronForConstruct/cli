import { Signale } from 'signale';
import { CliObject, moduleRun } from '../models';
import HooksManager from './hooksManager';
import { createLogger } from '../utils/console';

export interface CynModuleWrapper {
  alias: Record<string, string>;
  boolean: string[];
  default: Record<string, string>;
  command: CynModule;
}

export default abstract class CynModule {
  abstract name: string;

  abstract description: string;

  cli?: CliObject[];

  config?: object;

  abstract run: moduleRun;

  createLogger(interactive = false): Signale {
    return createLogger({
      scope: this.name,
      interactive,
    });
  }

  dispatchHook(hookName: string, hookArguments: unknown): Promise<boolean[]> | boolean[] {
    return HooksManager.getInstance().dispatch(hookName, hookArguments);
  }
}
