import { TaskRun } from '../models';

export default abstract class Task {
  abstract name: string;

  abstract description: string;

  abstract run: TaskRun;

  abstract config?: any;
}
