// cli = [
//   {
//     description: 'Clear the cache of the project',
//     name: 'clear-cache',
//     boolean: true,
//   },
// ];

export default {
  description: 'Setup the directory',
  name: 'electron/dev',
  config: {},
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  run: async function run({ workingDirectory, taskSettings }: any) {

    return {
      sources: [workingDirectory],
    };
  },
}
// const logger = this.createLogger();

// const sm = SettingsManager.getInstance();

// let workingDirectoryOrURL = options.path;

// if (!workingDirectoryOrURL) {
//   workingDirectoryOrURL = process.cwd();
// }

// // ----

// await sm.loadConfig(workingDirectoryOrURL);

// const tempDir = await setupDir('preview');

// await dispatchTask('build');

// await startPreview(workingDirectoryOrURL, tempDir);