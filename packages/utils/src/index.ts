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

export interface TaskRunResult {
  error?: Error,
  source: string
}

export interface TaskStep<T = unknown> {
  name: string
  config: T
}
export interface TaskSettings {
  description: string
  steps: TaskStep[]
}
export type TasksSettings = Record<string, TaskSettings>

export interface TaskIO<INPUT, OUTPUT> {
  input: INPUT;
  output: OUTPUT;
}

export interface Settings {
  // config: Record<string, ComplexConfig>
  // config: Record<string, SimpleConfig> | Record<string, ComplexConfig>

  commands?: TasksSettings
  // extends?: string[]
  plugins?: string[]

  // Root source folder
  input: string;
}

export interface Module<SETTINGS = any> {
  description: string;
  input: Partial<SETTINGS>;
  output: any
  run: (ctx: Ctx<SETTINGS>) => any;
}

export type Task<SETTINGS> = ListrTask<Ctx<SETTINGS>, any>

export type Plugin = Record<string, Module<unknown>>

export interface Ctx<SETTINGS> {
  workingDirectory: string;
  settings: Settings;
  taskSettings: SETTINGS;
  command: string;
}

export interface ComputedTask {
  description: string;
  debug?: boolean;
  steps: {
    name: string;
    config: unknown
  }[]
}

export interface ComputedSettings {
  [task: string]: ComputedTask
}