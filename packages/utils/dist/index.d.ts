import { Signale, SignaleOptions } from 'signale';
import { ListrBaseClassOptions, ListrTaskWrapper, Manager } from 'listr2';
export declare const createLogger: (options: SignaleOptions) => Signale;
export declare const createScopedLogger: (scope: string, options?: SignaleOptions) => Signale;
export declare const yarn: string;
export declare function TaskManagerFactory<T = any>(override?: ListrBaseClassOptions): Manager<T>;
export interface RunArguments {
    workingDirectory: string;
    settings: unknown;
    taskSettings: unknown;
}
export interface TaskRunResult {
    error?: Error;
    source: string;
}
export declare abstract class Task {
    abstract id: string;
    abstract description: string;
    abstract config?: any;
    abstract run(ctx: Ctx, task: ListrTaskWrapper<Ctx, any>): void;
}
export interface Ctx {
    workingDirectory: string;
    settings: any;
    taskSettings: any;
}
