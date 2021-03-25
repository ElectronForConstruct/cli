import { Plugin, Module, TaskStep } from '@cyn/utils';
import { Core } from '@cyn/core';

const Parallel: Module<TaskStep> = {
  description: 'Run tasks in parallel',
  id: 'parallel',
  config: {},

  tasks: [
    {
      title: 'parallel',
      task: async (ctx, task) => {

        const core = new Core()

        core.settingsManager.settings = ctx.settings;

        await core.loadTasks();

        const steps = ctx.taskSettings

        if (!steps) {
          return task.newListr([])
        }

        // console.log('steps', steps)

        const listr = core.fromTasksToListr(steps, task, ctx)

        // console.log('a', listr)

        return listr
      },
    },
  ]
}

export default {
  name: 'parallel',
  modules: [
    Parallel,
  ]
} as Plugin