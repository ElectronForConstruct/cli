const opn = require('opn');
const os = require('os');
const { Command } = require('@efc/core');

module.exports = class extends Command {
  constructor() {
    super('report-issue', 'Report an issue');
  }

  isVisible() {
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
};
