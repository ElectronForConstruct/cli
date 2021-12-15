import { Node } from '@baklavajs/core';

export const OPTION_VALUE = 'Value';
export const OUTPUT_VALUE = 'Value';

// eslint-disable-next-line import/prefer-default-export
export class String extends Node {
  type = 'String';

  name = 'String';

  constructor() {
    super();
    this.addOption(OPTION_VALUE, 'InputOption', '', undefined, {});
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
    const { value } = this.getOptionValue(OPTION_VALUE);
    console.log('value', value);
    this.getInterface(OUTPUT_VALUE).value = value;
  }
}
