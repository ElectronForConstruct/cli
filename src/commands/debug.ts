// eslint-disable-next-line
// @ts-ignore
import { dump } from 'dumper.js';
import {CynModule, Settings} from '../models';
import mri from "mri";

class Debug extends CynModule {
  name = 'debug';

  description = 'Show current configuration';

  run = (args: mri.Argv, settings: Settings): Promise<boolean> => {
    dump(config);
    return true;
  };
}

export const command = Debug;
export const hooks = [];
