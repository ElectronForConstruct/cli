import { ListrBaseClassOptions, ListrTask, Manager } from 'listr2';
export declare const yarn: string;
export declare function TaskManagerFactory<T = any>(override?: ListrBaseClassOptions): Manager<T>;
export interface TaskRunResult {
    error?: Error;
    source: string;
}
export interface TaskStep<T = unknown> {
    name: string;
    config: T;
}
export interface taskSettings {
    description: string;
    steps: TaskStep[];
}
export declare type TasksSettings = Record<string, taskSettings>;
export interface Settings {
    commands?: TasksSettings;
    plugins?: string[];
    input: string;
}
export interface Module<SETTINGS = any> {
    id: string;
    description: string;
    config?: Partial<SETTINGS>;
    tasks: ListrTask<Ctx<SETTINGS>, any>[];
}
export declare type Task<SETTINGS> = ListrTask<Ctx<SETTINGS>, any>;
export interface Plugin {
    name: string;
    modules: Module<unknown>[];
}
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
        config: unknown;
    }[];
}
export interface ComputedSettings {
    [task: string]: ComputedTask;
}
