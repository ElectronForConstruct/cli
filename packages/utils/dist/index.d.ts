import { SignaleOptions, Signale } from 'signale';

declare const createLogger: (options: SignaleOptions) => Signale;
declare const createScopedLogger: (scope: string, options?: SignaleOptions) => Signale;

export { createLogger, createScopedLogger };
