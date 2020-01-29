import { dump } from 'dumper.js';
import mri from 'mri';
import { CynModule, Settings } from '../models';

class Debug extends CynModule {
  name = 'debug';

  description = 'Show current configuration';

  run = (args: mri.Argv, settings: Settings): boolean => {
    dump(settings);
    return true;
  };
}

export const command = Debug;
export const hooks = [];
