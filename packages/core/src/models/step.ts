import {
  Ctx, Module, Settings, Logger, defaultLogger,
} from '@cyn/utils';

// eslint-disable-next-line import/prefer-default-export
export class Step<Input, Output> {
  // name: string;

  inputs: Input | undefined

  plugin: Module<Input, Output>

  settings: Settings;

  logger: Logger;

  constructor(plugin: Module<Input, Output>, settings: Settings) {
    this.plugin = plugin;

    this.settings = settings;

    this.logger = defaultLogger;
  }

  setInputs(inputs: Input) {
    this.inputs = inputs;
    return this;
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  async run() {
    if (!this.inputs) {
      throw new Error('Inputs have not been defined');
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { inputs, run } = this.plugin;
    const settings = { ...inputs, ...this.inputs };

    const ctx: Ctx<Input> = {
      settings: this.settings,
      taskSettings: settings,
      logger: this.logger,
    };
    return run(ctx);
  }
}
