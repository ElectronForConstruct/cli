import { Action } from './Action';

export const INPUT_FLOW = 'In';
export const INPUT_CONDITION = 'Condition';
export const OUTPUT_TRUE = 'True';
export const OUTPUT_FALSE = 'False';

// eslint-disable-next-line import/prefer-default-export
export class If extends Action {
  type = 'If';

  name = 'If';

  constructor() {
    super();
    this.addInputInterface(INPUT_CONDITION, 'InputOption', '');
    this.addInputInterface(INPUT_FLOW, 'InputOption', '');

    this.addOutputInterface(OUTPUT_TRUE);
    this.addOutputInterface(OUTPUT_FALSE);
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    console.log('If: ', this.getInterface(INPUT_CONDITION).value);
  }
}
