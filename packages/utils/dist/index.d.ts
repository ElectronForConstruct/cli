import { ListrBaseClassOptions, ListrTask, Manager } from 'listr2';
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
