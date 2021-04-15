import { Module } from '@cyn/utils';

interface DummyCtx {
  wait: number;
  message: string;
}

interface DummyOutput {
  wait: number;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Dummy: Module<DummyCtx, DummyOutput> = {
  description: 'Dummy',
  id: 'dummy',
  inputs: {
    message: '',
    wait: 1000
  },

  async run(ctx) {
    await sleep(ctx.taskSettings.wait)
    console.log('I\'m done')

    return {
      wait: ctx.taskSettings.wait
    }
  }
}

export const dummy = Dummy