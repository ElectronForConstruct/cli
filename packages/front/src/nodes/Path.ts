import { Node } from '@baklavajs/core';

// eslint-disable-next-line import/prefer-default-export
export class Path extends Node {
  type = 'Path';

  name = 'Path';

  constructor() {
    super();
    this.addOption('Value', 'InputOption', '', undefined, {});
    this.addOutputInterface('Value');
  }

  // eslint-disable-next-line class-methods-use-this
  calculate() {
    // const n1 = this.getInterface('Number 1').value;
    // const n2 = this.getInterface('Number 2').value;
    // const operation = this.getOptionValue('Operation');
    // let result;
    // if (operation === 'Add') {
    //   result = n1 + n2;
    // } else if (operation === 'Subtract') {
    //   result = n1 - n2;
    // }
    // this.getInterface('Result').value = result;
  }
}
