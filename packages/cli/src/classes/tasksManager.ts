import deepmerge from 'deepmerge';
import { Ctx, Module } from '@cyn/utils';
import { Listr } from 'listr2';
import { ComputedSettings } from '../models';

export default class ModuleManager {
  private static instance: ModuleManager

  private modules: Module<any>[] = [];

  static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  register(task: Module<any>): number {
    return this.modules.push(task);
  }

  registerAll(modules: Module<any>[]): void {
    for (let i = 0; i < modules.length; i += 1) {
      this.register(modules[i]);
    }
  }

  listAll(): Module<any>[] {
    return this.modules;
  }

  get(moduleName: string): Module<any> | undefined {
    return this.modules.find((task) => task.id === moduleName);
  }
}

export function startTasks(
  moduleName: string,
  settings: ComputedSettings,
  source: string,
): Promise<any> | any {
  const module = settings[moduleName];
  if (!module) {
    // logger.info(`No Tasks found for "${taskName}"`);
    return '';
  }

  const { steps } = module;

  const context: Ctx<unknown> = {
    workingDirectory: source,
    settings,
    taskSettings: {},
  };
  const tasks = new Listr<Ctx<unknown>>(
    [],
    {
      renderer: (module.debug === true) ? 'verbose' : 'default',
      ctx: context,
    },
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const step of steps) {
    if (!step) {
      return source;
    }

    const moduleInstance = ModuleManager.getInstance().get(step.name);
    if (moduleInstance) {
      // @ts-ignore
      const taskSettings = deepmerge.all([moduleInstance.config ?? {}, step.config ?? {}]);

      tasks.add({
        title: `Step: ${step.name}`,
        // @ts-ignore
        task(ctx, t) {
          ctx.taskSettings = taskSettings;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const { tasks: instanceTasks } = moduleInstance;
          // ctx = { ...resultCtx };
          return t.newListr(instanceTasks, {
            rendererOptions: { collapse: false },
          });
        },
        options: {
          bottomBar: 5,
        },
      });
    } else {
      // logger.error(`Cannot find Task ${step.name}`);
    }
  }

  return tasks.run();
}
