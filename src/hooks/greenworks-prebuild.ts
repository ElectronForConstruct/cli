import Hook from '../classes/hook';

const GWHook = class extends Hook {
  description = 'Run on the pre build step';

  hookName = 'pre-build';

  name = 'onPreBuild';

  run = (args: unknown) => Promise.resolve(true);
};

export default new GWHook();
