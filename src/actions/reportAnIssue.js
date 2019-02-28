import opn from 'opn';
import os from 'os';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('report-issue', 'Report an issue');
  }

  show() {
    return true;
  }

  async run() {
    const msg = `
Configuration:
- OS: ${os.platform()}
- Arch: ${os.arch()}

Steps to reproduce: 
- 
  `.trim();

    opn(`https://github.com/ElectronForConstruct/preview/issues/new?body=${encodeURI(msg)}`);
  }
}
