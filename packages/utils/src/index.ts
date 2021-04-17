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

export interface TaskIO<INPUT, OUTPUT> {
  input: INPUT;
  output: OUTPUT;
}

export interface Settings {
  commands?: TasksSettings
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

export interface Logger {
  log(str: string): void;
}

export const defaultLogger: Logger = {
  log(str) {
    console.log(str)
  }
}

export interface Ctx<SETTINGS> {
  settings: Settings;
  taskSettings: SETTINGS;
  logger: Logger
}

export interface TaskStep<T = unknown> {
  plugin: string
  id: string
  inputs: T
  outputs: Record<string, string>
}
export interface TaskSettings {
  description: string
  steps: TaskStep[]
  debug?: boolean;
}
export type TasksSettings = Record<string, TaskSettings>