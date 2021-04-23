import { Module } from '@cyn/utils';
import { Step } from '@cyn/core/dist/models/step';

class Parallel extends Module<{ steps: Step<unknown, unknown>[]}, unknown[]> {
  description = 'Run tasks in parallel'
  inputs = {
    steps: []
  }

  async run(task) {
    return Promise.all(task.steps.map(step => {
      return step.run();
    }));
  }
}

export const parallel = Parallel
export default {
  parallel: Parallel
}