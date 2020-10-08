import deepmerge from 'deepmerge';
import { createScopedLogger } from '@cyn/utils';
import Task from './task';
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
    return this.tasks.find((task) => task.name === taskName);
  }
}

export async function dispatchTask(
  taskName: string,
  settings: ComputedSettings,
  currentStep = 0,
  sources: string[],
): Promise<string[]> {
  const results: string[] = [];

  const task = settings[taskName];
  if (!task) {
    logger.info(`No Tasks found for "${taskName}"`);
    return [];
  }

  const { steps } = task;

  const step = steps[currentStep];

  if (!step) {
    return sources;
  }

  logger.start(`Step: ${step.name}`);
  const TaskInst = TaskManager.getInstance().get(step.name);
  if (TaskInst) {
    // @ts-ignore
    const taskSettings = deepmerge.all([TaskInst.config ?? {}, step.config ?? {}]);

    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
      const source = sources[sourceIndex];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const args = { settings, taskSettings, workingDirectory: source };
      const { sources: nextSources } = await TaskInst.run(args);
      // console.log('nextSources', nextSources);
      const outDirs = await dispatchTask(taskName, settings, currentStep + 1, nextSources);
      results.push(...outDirs);
    }
  } else {
    logger.error(`Cannot find Task ${step.name}`);
  }
  return results;
}
