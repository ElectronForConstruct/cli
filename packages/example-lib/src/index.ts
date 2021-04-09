import { Core } from '@cyn/core';
import itchModule from '@cyn/plugin-itch';

(async (): Promise<void> => {
  const core = new Core();

  const app = core
    .setInput('./src')
    .registerPlugin(itchModule);

  const command = app
    .createCommand('build');

  const stepWindows = command
    .createStep('itch')
    .addInput('project', 'armaldio/cyn-test')
    .addInput('channel', 'windows-beta')
    .addInput('BUTLER_API_KEY', 'G6ZSB87l287SAdq3gI7uIf5Lf2h0sR6cw3CoytBo')
    .addOutput('project', 'itchProject');

  const stepLinux = command
    .createStep('itch')
    .addInput('project', (outputs: any) => {
      console.log('1 outputs', outputs);
      return outputs.itchProject;
    })
    .addInput('channel', 'linux-beta')
    .addInput('BUTLER_API_KEY', 'G6ZSB87l287SAdq3gI7uIf5Lf2h0sR6cw3CoytBo');

  command.addStep(stepWindows).addStep(stepLinux);

  console.log('command', command);

  const result = await core.run(command);

  console.log('result', result);
})();
