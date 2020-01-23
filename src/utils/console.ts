import {
  Signale, SignaleOptions,
} from 'signale';

// eslint-disable-next-line import/prefer-default-export
export const createLogger = (options: SignaleOptions): Signale => {
  const log = new Signale(options);
  log.config({
    displayLabel: false,
  });
  return log;
};
