import { Module } from '@cyn/utils';
import { Step } from '@cyn/core/dist/models/step';

interface Input {
  steps: Step <unknown, unknown> []
}

class Parallel extends Module<Input, unknown[]> {
  description = 'Run tasks in parallel'
  inputs = {
    steps: []
  }

  override async run(task: Input) {
    return Promise.all(task.steps.map(step => {
      return step.run();
    }));
  }
}

export const parallel = Parallel
export default {
  parallel: Parallel
}