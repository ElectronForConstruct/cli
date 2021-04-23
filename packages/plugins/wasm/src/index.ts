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
  description = 'Dummy'

  inputs = {
    message: '',
    wait: 1000
  }

  override async run(task: DummyCtx) {
    const split = task.wait / 5

    for (let index = 0; index < 5; index++) {
      await sleep(split)
      this.logger.log('Round ' + index)
    }
    this.logger.log(task.message)

    return {
      message: task.message
    }
  }
}

export const dummy = Dummy

export default {
  dummy: Dummy
}