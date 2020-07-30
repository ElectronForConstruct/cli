import path from 'path';

const config: any = {
};

export default {
  description: 'Setup the directory',
  name: 'tauri/dev',
  config,
  run: async function run({ workingDirectory, taskSettings }: any) {
    const settings = taskSettings as any;

    process.chdir(workingDirectory);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dev = require('tauri/dist/api/dev');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const done = await dev({
      build: {
        distDir: path.join(workingDirectory, 'dist'),
        devPath: 'http://127.0.0.1:8080/',
      },
    });

    return {
      sources: [workingDirectory],
    };
  },
}
