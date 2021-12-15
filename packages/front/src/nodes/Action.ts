import { Node } from '@baklavajs/core';

export const INPUT_FLOW = 'In';
export const OUTPUT_FLOW = 'Out';

// eslint-disable-next-line import/prefer-default-export
export abstract class Action extends Node {
  type = 'Action';

  name = 'Action';

  constructor() {
    super();
    this.addInputInterface(INPUT_FLOW, 'InputOption', '');

    // this.addOutputInterface(OUTPUT_FLOW);
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    console.log('Flow: ');
  }
}
