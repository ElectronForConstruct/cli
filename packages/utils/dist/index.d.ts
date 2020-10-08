import { Signale, SignaleOptions } from 'signale';
export declare const createLogger: (options: SignaleOptions) => Signale;
export declare const createScopedLogger: (scope: string, options?: SignaleOptions) => Signale;
