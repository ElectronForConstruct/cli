import deepmerge from 'deepmerge';
import { Task, createScopedLogger, Ctx } from '@cyn/utils';
import { Listr } from 'listr2';
import { ComputedSettings } from '../models';

const logger = createScopedLogger('system');

export default class TaskManager {
  private static instance: TaskManager

  private tasks: Task[] = [];

  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  register(task: Task): number {
    return this.tasks.push(task);
  }

  registerAll(tasks: Task[]): void {
    for (let i = 0; i < tasks.length; i += 1) {
      this.register(tasks[i]);
    }
  }

  listAll(): Task[] {
    return this.tasks;
  }

  get(taskName: string): Task | undefined {
    return this.tasks.find((task) => task.id === taskName);
  }
}

export function startTasks(
  taskName: string,
  settings: ComputedSettings,
  source: string,
): Promise<any> | any {
  console.log('settings', settings);

  const task = settings[taskName];
  if (!task) {
    logger.info(`No Tasks found for "${taskName}"`);
    return '';
  }

  const { steps } = task;

  const context: Ctx = {
    workingDirectory: source,
    settings,
    taskSettings: {},
  };
  const tasks = new Listr<Ctx>(
    [],
    {
      renderer: 'verbose',
      ctx: context,
    },
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const step of steps) {
    if (!step) {
      return source;
    }

    const TaskInst = TaskManager.getInstance().get(step.name);
    if (TaskInst) {
    // @ts-ignore
      const taskSettings = deepmerge.all([TaskInst.config ?? {}, step.config ?? {}]);

      tasks.add({
        title: `Step: ${step.name}`,
        task: async (ctx, t) => {
          ctx.taskSettings = taskSettings;

          const resultCtx = await TaskInst.run(ctx, t);
          console.log('resultCtx', resultCtx);
          // ctx = { ...resultCtx };
          return ctx;
        },
      });
    } else {
      logger.error(`Cannot find Task ${step.name}`);
    }
  }

  return tasks.run();
}
