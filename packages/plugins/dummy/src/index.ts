import { Plugin, Module } from '@cyn/utils';

interface ItchCtx {
  wait: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Itch: Module<ItchCtx> = {
  description: 'Dummy',
  id: 'dummy',
  config: {
  },

  tasks: [
    {
      title: 'Dummy task',
      task: async (ctx, task) => {
        task.output = "Before sleep"
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