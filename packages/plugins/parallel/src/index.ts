import { Plugin, Module, TaskStep } from '@cyn/utils';
import { Core } from '@cyn/core';

const Parallel: Module<TaskStep[]> = {
  description: 'Run tasks in parallel',
  id: 'parallel',
  config: [],

  tasks: [
    {
      title: 'Running multiple tasks...',
      task: async (ctx, task) => {
        const core = new Core()

        core.settingsManager.settings = ctx.settings;

        await core.loadTasks();

        const steps = ctx.taskSettings

        if (!steps) {
          return task.newListr([])
        }

        // console.log('steps', steps)

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const listr = core.fromStepsToListr(steps, task, ctx, {
          concurrent: true
        })

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