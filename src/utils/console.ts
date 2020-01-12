import { Signale, SignaleOptions } from 'signale';

const show = (options: SignaleOptions) => {
  const log = new Signale(options);
  log.config({
    displayLabel: false,
  });
  return log;
};

const createNormalLogger = (scope: string) => show({
  scope,
});

const createInteractiveLogger = (scope: string) => show({
  scope,
  interactive: true,
});

export {
  show,
  createNormalLogger,
  createInteractiveLogger,
};
