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

export interface Ctx {
  settings: Settings;
  cwd: string;
  logger: Logger;
}

export abstract class Module<Input, Output> {
  abstract description: string;
  abstract inputs: Input;

  protected settings: Settings;
  protected cwd: string;
  protected logger: Logger;

  constructor(context: Ctx) {
    this.settings = context.settings
    this.cwd = context.cwd
    this.logger = context.logger
  }

  run(task: Input): Promisable<Output> {
    throw new Error('Not Implemented')
  };
}

type AbstractConstructorHelper<T> = (new (...args: any) => { [x: string]: any; }) & T;
type AbstractContructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;

// Params resolved to [string, number]
type Params = AbstractContructorParameters<typeof Module>;

export type AModule<I, O> = new (...args: Params) => Module<I, O>

export type Plugin = Record<string, AModule<unknown, unknown>>

export interface Logger {
  log(str: string): void;
}

export const defaultLogger: Logger = {
  log(str) {
    console.log(str)
  }
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