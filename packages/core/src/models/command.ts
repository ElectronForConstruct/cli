import { AModule, Settings } from '@cyn/utils';
import { Step } from './step';

// eslint-disable-next-line import/prefer-default-export
export class Command {
  name: string;

  steps: Step<unknown, unknown>[]

  settings: Settings;

  constructor(name: string, settings: Settings) {
    this.name = name;
    this.steps = [];

    this.settings = settings;
  }

  createStep<I, O>(module: AModule<I, O>) {
    const step = new Step<I, O>(module, this.settings);
    return step;
  }
}
