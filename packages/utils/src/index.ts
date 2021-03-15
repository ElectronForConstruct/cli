import path from 'path'
import { ListrBaseClassOptions, ListrTask, Manager } from 'listr2';

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

export interface Module<SETTINGS> {
  id: string;
  description: string;
  config?: Partial<SETTINGS>;
  tasks: ListrTask<Ctx<SETTINGS>, any>[];
}

export type Task<SETTINGS> = ListrTask<Ctx<SETTINGS>, any>

export interface Plugin {
  name: string;
  modules: Module<any> []
}

export interface Ctx<SETTINGS> {
  workingDirectory: string;
  settings: any;
  taskSettings: SETTINGS;
}