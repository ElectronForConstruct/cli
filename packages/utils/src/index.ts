import path from 'path'
import { Promisable } from 'type-fest';
export const yarn = path.join(__dirname, '..', 'lib', 'yarn.js')

class Input <T> {
  required: boolean;
  validator: (value: T) => boolean;
  value: T | null;

  constructor(required = true, validator = () => true) {
    this.required = required
    this.validator = validator
    this.value = null
  }

  define(value: T) {
    this.value = value
  }
}

export const createInput = (required = true, validator = () => true) => {
  return new Input(required, validator)
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

export interface Module<Input, Output> {
  description: string;

  id: string;

  inputs: Input;

  run(ctx: Ctx<Input>): Promisable<Output>;
}

export type Plugin = Record<string, Module<Object, unknown>>

export interface Ctx<SETTINGS> {
  settings: Settings;
  taskSettings: SETTINGS;
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