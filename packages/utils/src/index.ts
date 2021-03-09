import path from 'path'
import { Listr, ListrBaseClassOptions, ListrTask, ListrTaskWrapper, Manager } from 'listr2';
import { DefaultRenderer } from 'listr2/dist/renderer/default.renderer';
import { Promisable } from 'type-fest';

export const yarn = path.join(__dirname, '..', 'lib', 'yarn.js')

export function TaskManagerFactory<T = any>(override?: ListrBaseClassOptions): Manager<T> {
  const myDefaultOptions: ListrBaseClassOptions = {
    concurrent: false,
    exitOnError: false,
    rendererOptions: {
      collapse: false,
      collapseSkips: false
    }
  }
  return new Manager({ ...myDefaultOptions, ...override })
}

export interface RunArguments {
  workingDirectory: string
  settings: unknown
  taskSettings: unknown
}

export interface TaskRunResult {
  error?: Error,
  source: string
}

export interface Plugin<SETTINGS> {
  id: string;
  description: string;
  config?: Partial<Ctx<SETTINGS>>;
  tasks: ListrTask<Ctx<SETTINGS>, any>[];
}

export interface Ctx<SETTINGS> {
  workingDirectory: string;
  settings: any;
  taskSettings: SETTINGS;
}

// export async function createPlugin <SETTINGS>(task: Task<SETTINGS>): Promise<() => ListrTask<SETTINGS, any>> {
//   // @ts-ignore
//   return (t) => t.newListr(task.tasks)
// }