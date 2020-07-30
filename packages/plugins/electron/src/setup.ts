import setupDir from './setupDir';
import SetupConfig from './models';

const config: SetupConfig = {
  version: '8.2.4',
  clearCache: true,
  project: {
    author: 'Me',
  },
};

export default {
  description: 'Setup the directory',
  name: 'electron/setup',
  config,
  run: async function run({ workingDirectory, taskSettings }: any) {
    const settings = taskSettings as SetupConfig;
    const tempDir = await setupDir('build', settings);

    return {
      sources: [tempDir],
    };
  }
}
