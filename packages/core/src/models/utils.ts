/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/prefer-default-export
import { Promisable } from 'type-fest';

export function ObjToArr<T>(
  data: Record<string | number | symbol, T>,
  keyToTranslate = 'key',
) {
  return Object
    .entries(data)
    .map(([key, value]) => Object.assign(value, { [keyToTranslate]: key }));
}

export const yarn = async () => {
  const path = await import('path');
  return path.join(__dirname, '..', 'lib', 'yarn.js');
};

class Input <T> {
  required: boolean;

  validator: (value: T) => boolean;

  value: T | null;

  constructor(required = true, validator = () => true) {
    this.required = required;
    this.validator = validator;
    this.value = null;
  }

  define(value: T) {
    this.value = value;
  }
}

export const createInput = (
  required = true,
  validator = () => true,
) => new Input(required, validator);

export interface TaskRunResult {
  error?: Error,
  source: string
}

export interface TaskIO<INPUT, OUTPUT> {
  input: INPUT;
  output: OUTPUT;
}

export interface Settings {
  // eslint-disable-next-line no-use-before-define
  commands?: TasksSettings
  plugins?: string[]

  // Root source folder
  input: string;
}

export interface Ctx {
  settings: Settings;
  cwd: string;
  // eslint-disable-next-line no-use-before-define
  logger: Logger;
}

export abstract class Module<INPUT, OUTPUT> {
  abstract description: string;

  abstract inputs: INPUT;

  protected settings: Settings;

  protected cwd: string;

  // eslint-disable-next-line no-use-before-define
  protected logger: Logger;

  constructor(context: Ctx) {
    this.settings = context.settings;
    this.cwd = context.cwd;
    this.logger = context.logger;
  }

  run(task: INPUT): Promisable<OUTPUT> {
    throw new Error('Not Implemented');
  }
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
    console.log(str);
  },
};

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
