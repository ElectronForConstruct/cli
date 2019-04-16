const opn = require('../utils/openURL');

module.exports = {
  name: 'donate',
  description: 'Open a link where you can donate to support this app',

  run() {
    opn('https://armaldio.xyz/#/donations');
  },
};
