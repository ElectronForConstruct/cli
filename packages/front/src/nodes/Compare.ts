import { Node } from '@baklavajs/core';

export const OPTION_A = 'A';
export const OPTION_B = 'B';

export const OUTPUT_VALUE = 'Value';

// eslint-disable-next-line import/prefer-default-export
export class Compare extends Node {
  type = 'Compare';

  name = 'Compare';

  constructor() {
    super();
    this.addInputInterface(OPTION_A, 'InputOption', '');
    this.addInputInterface(OPTION_B, 'InputOption', '');
    this.addOutputInterface(OUTPUT_VALUE);
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
    // const { value } = this.getOptionValue(OPTION_VALUE);
    // console.log('value', value);
    // this.getInterface(OUTPUT_VALUE).value = value;
  }
}
