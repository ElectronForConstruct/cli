import setupDir from '../../utils/setupDir';
import startPreview from '../../utils/startPreview';
import SettingsManager from '../../classes/settingsManager';
import { dispatchTask } from '../../classes/TasksManager';

// cli = [
//   {
//     description: 'Clear the cache of the project',
//     name: 'clear-cache',
//     boolean: true,
//   },
// ];

export default function run(options: any): boolean {
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
  return true;
}
