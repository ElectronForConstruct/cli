const opn = require('../utils/openURL');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'donate',
  description: 'Open a link where you can donate to support this app',

  run() {
    opn('https://armaldio.xyz/#/donations');
  },
};
