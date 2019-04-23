/**
 * @type EFCModule
 */
module.exports = {
  name: 'issue',
  description: 'Report an issue',

  run() {
    const opn = require('../utils/openURL');
    const os = require('os');
    const msg = `
Configuration:
- OS: ${os.platform()}
- Arch: ${os.arch()}

Steps to reproduce: 
- 
  `.trim();

    opn(`https://github.com/ElectronForConstruct/preview/issues/new?body=${encodeURI(msg)}`);
  },
};
