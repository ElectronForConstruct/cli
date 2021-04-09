// eslint-disable-next-line import/prefer-default-export
export class Step {
  name: string;

  inputs: Map<string, any>

  outputs: Map<string, string>

  constructor(name: string) {
    this.name = name;
    this.inputs = new Map();
    this.outputs = new Map();
  }

  addInput(name: string, value: any) {
    this.inputs.set(name, value);
    return this;
  }

  addOutput(name: string, value: string) {
    this.outputs.set(name, value);
    return this;
  }
}
