const { Command } = require('@efc/core');
const startPreview = require('../utils/startPreview');

module.exports = class extends Command {
  constructor() {
    super('preview-folder', 'App Folder', 'a');
    this.setCategory('Preview');
  }

  async run() {
    await startPreview();
  }
};
