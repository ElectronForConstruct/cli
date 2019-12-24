// eslint-disable-next-line
// @ts-ignore
import { dump } from 'dumper.js';
import { CynModule } from '../definitions';

const command: CynModule = {
  name: 'debug',
  description: 'Show current configuration',

  run(args, config) {
    dump(config);
    return true;
  },
};

export default command;
