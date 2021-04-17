import { Core } from '@cyn/core';
import { parallel } from '@cyn/plugin-parallel';
import { dummy } from '@cyn/plugin-dummy';
import { itch } from '@cyn/plugin-itch';

(async (): Promise<void> => {
  const core = new Core();

  const app = core.setInput('./src');

  const command = app.createCommand('build');
  const stepWindows = command.createStep(itch);
  const stepLinux = command.createStep(itch);

  const output1 = await stepWindows
    .setInputs({
      project: 'armaldio/cyn-test',
      channel: 'windows-beta',
      BUTLER_API_KEY: 'G6ZSB87l287SAdq3gI7uIf5Lf2h0sR6cw3CoytBo',
    })
    .run();

  const output2 = await stepLinux
    .setInputs({
      project: output1.project,
      channel: 'linux-beta',
      BUTLER_API_KEY: 'G6ZSB87l287SAdq3gI7uIf5Lf2h0sR6cw3CoytBo',
    })
    .run();

  console.log('output2', output2);
})();

(async (): Promise<void> => {
  const core = new Core();

  const app = core.setInput('./src');

  const command = app.createCommand('build');
  const parallelStep = command.createStep(parallel);

  const dummy1 = command.createStep(dummy).setInputs({
    message: 'Hello1',
    wait: 5000,
  });
  const dummy2 = command.createStep(dummy).setInputs({
    message: 'Hello2',
    wait: 2000,
  });

  const output1 = await parallelStep.setInputs({
    steps: [
      dummy1,
      dummy2,
    ],
  }).run();

  console.log('output1', output1);

  // const output2 = await command.createStep(itch)
  //   .setInputs({
  //     project: (output1[0] as any).type,
  //     channel: 'linux-beta',
  //     BUTLER_API_KEY: 'G6ZSB87l287SAdq3gI7uIf5Lf2h0sR6cw3CoytBo',
  //   })
  //   .run();

  // console.log('output2', output2);
})();
