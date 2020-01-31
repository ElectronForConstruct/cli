import { dump } from 'dumper.js';
import mri from 'mri';
import { Settings } from '../models';
import CynModule from '../classes/cynModule';

export default class extends CynModule {
  name = 'debug';

  description = 'Show current configuration';

  run = (args: mri.Argv, settings: Settings): boolean => {
    dump(settings);
    return true;
  };
}
