import { Plugin, Module } from '@cyn/utils';

interface DummyCtx {
  wait: number;
  message: string;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Itch: Module<DummyCtx> = {
  description: 'Dummy',
  id: 'dummy',
  config: {
  },

  tasks: [
    {
      title: 'Waiting...',
      task: async (ctx, task) => {
        // console.log('ctx.taskSettings', ctx)
        task.output = ctx.taskSettings.message
        await sleep(ctx.taskSettings.wait)

        return task
      },
    },
  ]
}

export default {
  name: 'dummy',
  modules: [
    Itch,
  ]
} as Plugin