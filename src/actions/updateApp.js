import request from 'request';
import fs from 'fs';
import zip from 'zip-a-folder';
import install from 'install-packages';
import { prompt } from 'enquirer';
import Command from '../Command';
import downloadPreview from '../utils/downloadPreview';
import { isNewTemplateVersionAvailable } from '../updateCheck';

export default class extends Command {
  constructor() {
    super('update', 'Update current template', 'u');
    this.setCategory('Utility');
  }

  show() {
    return this.config.isReady && this.config.isElectron;
  }

  async onLoad() {
    const newVersion = await isNewTemplateVersionAvailable();

    if (newVersion) this.name += ` (${newVersion.local} -> ${newVersion.remote})`;
  }

  async run() {
    const fullDirectoryPath = process.cwd();
    const backupName = `${fullDirectoryPath}-${Date.now().toString()}.zip`;
    // const folderName = path.basename(process.cwd());

    const response = await prompt({
      type: 'confirm',
      name: 'choice',
      initial: false,
      message: 'Do you want to backup your project before updating ?',
    });

    if (response.choice) {
      console.log(`Backing up your files to ${backupName} ...`);

      // make a zip backup
      await zip.zip(fullDirectoryPath, backupName);
    }

    const filesToUpdate = ['preload.js', 'package.json', 'main.js'];
    const promises = [];

    console.log('Updating files...');

    const prom = file => new Promise((resolve) => {
      request.get({
        url: `https://raw.githubusercontent.com/ElectronForConstruct/template/${this.config.settings.project.branch}/template/${file}`,
        json: false,
      }, (e, r, content) => {
        resolve({
          content,
          file,
        });
      });
    });

    // queue
    filesToUpdate.forEach((file) => {
      promises.push(prom(file));
    });

    const resultFiles = await Promise.all(promises);

    // write files
    resultFiles.forEach(({ content, file }) => {
      fs.writeFileSync(file, content, 'utf8');
    });

    await downloadPreview(process.cwd());

    // install deps

    console.log(`Restoring packages: ${this.config.settings.dependencies.join(', ')}`);

    await install();
    await install({ packages: this.config.settings.dependencies });

    // profit
  }
}
