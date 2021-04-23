import {
  Ctx, AModule, Settings, Logger, defaultLogger,
} from '@cyn/utils';

// eslint-disable-next-line import/prefer-default-export
export class Step<Input, Output> {
  // name: string;

  inputs: Input | undefined

  plugin: AModule<Input, Output>

  settings: Settings;

  logger: Logger;

  constructor(plugin: AModule<Input, Output>, settings: Settings) {
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

  run() {
    if (!this.inputs) {
      throw new Error('Inputs have not been defined');
    }

    const Plugin = this.plugin;

    const ctx: Ctx = {
      settings: this.settings,
      logger: this.logger,
      cwd: '',
    };
    const plugin = new Plugin(ctx);

    return plugin.run({ ...plugin.inputs, ...this.inputs });
  }
}
