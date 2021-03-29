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
        task.output = "Before sleep"
        console.log('ctx.taskSettings', ctx)
        task.output = ctx.taskSettings.message
        await sleep(ctx.taskSettings.wait)
        task.output = "After sleep"
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