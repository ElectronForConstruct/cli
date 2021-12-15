import { Node } from '@baklavajs/core';

export const OUTPUT_FLOW = 'Out';

// eslint-disable-next-line import/prefer-default-export
export class Start extends Node {
  type = 'Start';

  name = 'Start';

  constructor() {
    super();
    this.addOutputInterface(OUTPUT_FLOW);
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    //
  }
}
