import {
  Signale,
  SignaleOptions,
} from 'signale';

export const createLogger = (options: SignaleOptions): Signale => {
  const log = new Signale(options);
  log.config({
    displayLabel: false,
  });
  return log;
};

export const createScopedLogger = (scope: string, options: SignaleOptions = {}): Signale => {
  options.scope = scope;
  return createLogger(options);
};
