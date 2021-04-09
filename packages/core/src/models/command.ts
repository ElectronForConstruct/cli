import { Step } from './Step';

// eslint-disable-next-line import/prefer-default-export
export class Command {
  name: string;

  steps: Step[]

  constructor(name: string) {
    this.name = name;
    this.steps = [];
  }

  addStep(step: Step) {
    this.steps.push(step);
    return this;
  }

  createStep(name: string) {
    const step = new Step(name);
    return step;
  }
}
