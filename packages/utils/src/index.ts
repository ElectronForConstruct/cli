import {
  Signale,
  SignaleOptions,
} from 'signale';
import path from 'path'
import { ListrBaseClassOptions, ListrTaskWrapper, Manager } from 'listr2';

export const createLogger = (options: SignaleOptions): Signale => {
  // @ts-ignore
  return {
    log() {

    },
    info() {

    },
    success() {
      
    }
  }
  /**
  const log = new Signale(options);
  log.config({
    displayLabel: false,
  });
  return log;
   */
};

export const createScopedLogger = (scope: string, options: SignaleOptions = {}): Signale => {
  options.scope = scope;
  return createLogger(options);
};

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

export abstract class Task {
  abstract id: string;

  abstract description: string;

  abstract config?: any = {};

  abstract run(ctx: Ctx, task: ListrTaskWrapper<Ctx, any>): void;
}

export interface Ctx {
  workingDirectory: string;
  settings: any;
  taskSettings: any;
}