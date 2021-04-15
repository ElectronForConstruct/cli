import {
  Ctx, Module, Settings,
} from '@cyn/utils';

// eslint-disable-next-line import/prefer-default-export
export class Step<Input, Output> {
  // name: string;

  inputs: Input | undefined

  module: Module<Input, Output>

  settings: Settings;

  constructor(module: Module<Input, Output>, settings: Settings) {
    this.module = module;

    this.settings = settings;
  }

  setInputs(inputs: Input) {
    this.inputs = inputs;
    return this;
  }

  async run() {
    if (!this.inputs) {
      throw new Error('Inputs have not been defined');
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { inputs, run } = this.module;
    const settings = { ...inputs, ...this.inputs };

    const ctx: Ctx<Input> = {
      settings: this.settings,
      taskSettings: settings,
    };
    return run(ctx);
  }
}
