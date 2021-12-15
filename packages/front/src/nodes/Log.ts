import { Node } from '@baklavajs/core';

export const INPUT_VALUE = 'Value';
export const INPUT_FLOW = 'In';

// eslint-disable-next-line import/prefer-default-export
export class Log extends Node {
  type = 'Log';

  name = 'Log';

  constructor() {
    super();
    this.addInputInterface(INPUT_VALUE, 'InputOption', '');
    this.addInputInterface(INPUT_FLOW, 'InputOption', '');
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    console.log('Log: ', this.getInterface(INPUT_VALUE).value);
  }
}
