const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('rich-presence', 'Configure Discord Rich Presence');

    // this.setCategory('Publish');
  }

  /**
   * Command
   */

  async onPreBuild() {
    await this.run();
  }

  async run() {
    //
  }
};
