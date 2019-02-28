import startPreview from '../utils/startPreview';
import Command from '../Command';

export default class extends Command {
  constructor() {
    super('preview-folder', 'App Folder', 'a');
    this.setCategory('Preview');
  }

  async run() {
    await startPreview();
  }
}
