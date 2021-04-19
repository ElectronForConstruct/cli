import { Module, Plugin } from '@cyn/utils';

interface DummyCtx {
  wait: number;
  message: string;
}

interface DummyOutput {
  message: string;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Dummy extends Module<DummyCtx, DummyOutput> {
  description ='Dummy'
  id = 'dummy'
  inputs = {
    message: '',
    wait: 1000
  }

  async run(ctx) {
    const split = ctx.taskSettings.wait / 5

    for (let index = 0; index < 5; index++) {
      await sleep(split)
      ctx.logger.log('Round ' + index)
    }
    ctx.logger.log(ctx.taskSettings.message)

    return {
      message: ctx.taskSettings.message
    }
  }
}

export const dummy = Dummy

export default {
  modules: [Dummy]
} as Plugin