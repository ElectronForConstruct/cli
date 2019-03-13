const request = require('request');
const fs = require('fs');
const zip = require('zip-a-folder');
const { prompt } = require('enquirer');
const { Command } = require('@efc/core');
const installAllDeps = require('../utils/installAllDeps');
const downloadPreview = require('../utils/downloadPreview');
const { isNewTemplateVersionAvailable } = require('../updateCheck');

module.exports = class extends Command {
  constructor() {
    super('update', 'Update current template', 'u');
    this.setCategory('Utility');
  }

  isVisible() {
    return this.config.isReady && this.config.isElectron;
  }

  async onLoad() {
    const newVersion = await isNewTemplateVersionAvailable(this.settings);

    if (newVersion) this.name += ` (${newVersion.local} -> ${newVersion.remote})`;
  }

  async run() {
    const { settings } = this;
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
        url: `https://raw.githubusercontent.com/ElectronForConstruct/template/${settings.project.branch}/template/${file}`,
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

    await installAllDeps(settings);

    // profit
  }
};
