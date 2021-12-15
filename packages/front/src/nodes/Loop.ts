import { Node } from '@baklavajs/core';

export const INPUT_FLOW = 'In';
export const INPUT_ARRAY = 'Array';
export const INPUT_FIRST = 'First';
export const INPUT_LAST = 'Last';
export const INPUT_STEP = 'Step';

export const OUTPUT_ON_EXIT = 'On Exit';
export const OUTPUT_ON_BODY = 'On Body';
export const OUTPUT_BODY = 'Item';
export const OUTPUT_INDEX = 'Index';

// eslint-disable-next-line import/prefer-default-export
export class Loop extends Node {
  type = 'Loop';

  name = 'Loop';

  constructor() {
    super();
    this.addInputInterface(INPUT_FLOW, 'InputOption', '');
    this.addInputInterface(INPUT_ARRAY, 'InputOption', '');
    this.addInputInterface(INPUT_FIRST, 'InputOption', 0);
    this.addInputInterface(INPUT_LAST, 'InputOption', '');
    this.addInputInterface(INPUT_STEP, 'InputOption', 1);

    this.addOutputInterface(OUTPUT_ON_EXIT);
    this.addOutputInterface(OUTPUT_ON_BODY);
    this.addOutputInterface(OUTPUT_BODY);
    this.addOutputInterface(OUTPUT_INDEX);
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    console.log('Loop: ', this.getInterface(INPUT_FLOW).FLOW);
  }
}
