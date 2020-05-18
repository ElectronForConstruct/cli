import { dump } from 'dumper.js';
import mri from 'mri';
import SettingsManager from '../classes/settingsManager';

export default class {
  name = 'debug';

  description = 'Show current configuration';

  run = (args: mri.Argv): boolean => {
    const sm = SettingsManager.getInstance();

    const { settings } = sm;

    dump(settings);
    return true;
  };
}
