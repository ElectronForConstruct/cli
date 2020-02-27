import { dump } from 'dumper.js';
import mri from 'mri';
import CynModule from '../classes/cynModule';
import SettingsManager from '../classes/settingsManager';

export default class extends CynModule {
  name = 'debug';

  description = 'Show current configuration';

  run = (args: mri.Argv): boolean => {
    const sm = SettingsManager.getInstance();

    const { settings } = sm;

    dump(settings);
    return true;
  };
}
