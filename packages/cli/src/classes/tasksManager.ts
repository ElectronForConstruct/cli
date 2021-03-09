import deepmerge from 'deepmerge';
import { Task, Ctx } from '@cyn/utils';
import { Listr } from 'listr2';
import { ComputedSettings } from '../models';

export default class TaskManager {
  private static instance: TaskManager

  private tasks: Task<any>[] = [];

  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  register(task: Task<any>): number {
    return this.tasks.push(task);
  }

  registerAll(tasks: Task<any>[]): void {
    for (let i = 0; i < tasks.length; i += 1) {
      this.register(tasks[i]);
    }
  }

  listAll(): Task<any>[] {
    return this.tasks;
  }

  get(taskName: string): Task<any> | undefined {
    return this.tasks.find((task) => task.id === taskName);
  }
}

export function startTasks(
  taskName: string,
  settings: ComputedSettings,
  source: string,
): Promise<any> | any {
  const task = settings[taskName];
  if (!task) {
    // logger.info(`No Tasks found for "${taskName}"`);
    return '';
  }

  const { steps } = task;

  const context: Ctx<unknown> = {
    workingDirectory: source,
    settings,
    taskSettings: {},
  };
  const tasks = new Listr<Ctx<unknown>>(
    [],
    {
      // renderer: 'verbose',
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
        // @ts-ignore
        task: (ctx, t) => {
          ctx.taskSettings = taskSettings;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const { tasks: instanceTasks } = TaskInst;
          // ctx = { ...resultCtx };
          return t.newListr(instanceTasks);
        },
      });
    } else {
      // logger.error(`Cannot find Task ${step.name}`);
    }
  }

  return tasks.run();
}
