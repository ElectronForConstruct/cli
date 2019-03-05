const startPreview = require('../utils/startPreview');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('preview-folder', 'App Folder', 'a');
    this.setCategory('Preview');
  }

  async run() {
    await startPreview();
  }
};