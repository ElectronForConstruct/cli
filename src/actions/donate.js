module.exports = {
  name: 'donate',
  description: 'Open a link where you can donate to support this app',

  run() {
    const opn = require('opn');
    opn('https://armaldio.xyz/#/donations');
  },
};
