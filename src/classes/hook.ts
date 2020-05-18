import { hookRun } from '../models';

export default abstract class Hook {
  abstract name: string;

  abstract description: string;

  abstract bind: string;

  abstract run: hookRun;
}
