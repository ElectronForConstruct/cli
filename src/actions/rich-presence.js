/**
 * @type EFCModule
 */
module.exports = {
  name: 'rich-presence',
  description: 'Configure Discord Rich Presence',

  async onPreBuild() {
    await this.run();
  },

  async run() {
    //
  },
};
