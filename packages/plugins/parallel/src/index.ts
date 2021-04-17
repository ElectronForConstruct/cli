import { Module } from '@cyn/utils';
import { Step } from '@cyn/core/dist/models/step';

const Parallel: Module<{ steps: Step<unknown, unknown>[]}, unknown[]> = {
  description: 'Run tasks in parallel',
  id: 'parallel',
  inputs: {
    steps: []
  },
  async run(ctx) {
    return Promise.all(ctx.taskSettings.steps.map(step => {
      return step.run();
    }));
  }
}

export const parallel = Parallel
export default {
  parallel: Parallel
}