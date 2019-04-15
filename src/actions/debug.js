/**
 * Debug command
 * @type {module.Debug}
 * @extends module.Command
 */
module.exports = {
  name: 'debug',
  description: 'Show current confiuration',

  run() {
    console.log(this.settings);
  },
};
